import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faEthernet, faExchangeAlt, faHdd, faMemory, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { ServerContext } from '@/state/server';
import { bytesToHuman, formatIp, megabytesToHuman } from '@/helpers';
import { usePermissions } from '@/plugins/usePermissions';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

interface Stats {
    memory: number;
    cpu: number;
    disk: number;
    uptime: number;
    rx: number;
    tx: number;
}

const emptyStats: Stats = { memory: 0, cpu: 0, disk: 0, uptime: 0, rx: 0, tx: 0 };

type Tone = 'green' | 'red' | 'yellow';

const statusInfo = (status: string | null, installing: boolean, transferring: boolean): { label: string; tone: Tone; pulse: boolean } => {
    if (installing) return { label: 'Installation', tone: 'yellow', pulse: true };
    if (transferring) return { label: 'Transfert', tone: 'yellow', pulse: true };

    switch (status) {
        case 'running':
            return { label: 'En ligne', tone: 'green', pulse: false };
        case 'offline':
            return { label: 'Hors ligne', tone: 'red', pulse: false };
        case 'starting':
            return { label: 'Démarrage', tone: 'yellow', pulse: true };
        case 'stopping':
            return { label: 'Arrêt en cours', tone: 'yellow', pulse: true };
        default:
            return { label: 'Connexion…', tone: 'yellow', pulse: true };
    }
};

const dotColors: Record<Tone, string> = { green: '#22c55e', red: '#ef4444', yellow: '#fab219' };

const card = tw`rounded-xl border border-white border-opacity-5 bg-neutral-900`;
const numeric = { fontVariantNumeric: 'tabular-nums' } as const;

const usageColor = (ratio: number): string => (ratio >= 0.95 ? '#ef4444' : ratio >= 0.8 ? '#fab219' : '#3ddc97');

const Metric = ({ icon, label, value, limit, ratio, footer }: {
    icon: IconDefinition;
    label: string;
    value: string;
    limit?: string;
    ratio?: number | null;
    footer?: React.ReactNode;
}) => (
    <div css={[ card, tw`flex flex-col justify-between p-4 sm:p-5` ]}>
        <div css={tw`flex items-center gap-2 text-xs font-semibold text-neutral-400`}>
            <FontAwesomeIcon icon={icon} fixedWidth css={tw`text-neutral-500`}/>
            {label}
        </div>

        <p css={tw`mt-3 font-header text-2xl font-extrabold leading-none text-neutral-50`} style={numeric}>
            {value}
            {limit && <span css={tw`ml-1.5 text-xs font-semibold text-neutral-500`}>/ {limit}</span>}
        </p>

        <div css={tw`mt-4 min-h-[1.25rem]`}>
            {typeof ratio === 'number' && (
                <div css={tw`flex items-center gap-3`}>
                    <div css={tw`h-1.5 flex-1 overflow-hidden rounded-full bg-white bg-opacity-10`}>
                        <div
                            css={tw`h-full rounded-full`}
                            style={{ width: `${Math.min(100, ratio * 100)}%`, background: usageColor(ratio), transition: 'width 600ms ease, background-color 300ms' }}
                        />
                    </div>
                    <span css={tw`w-9 text-right text-xs font-semibold text-neutral-300`} style={numeric}>{Math.round(ratio * 100)} %</span>
                </div>
            )}
            {footer}
        </div>
    </div>
);

const PowerButton = ({ label, disabled, onClick, variant }: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    variant: 'start' | 'neutral' | 'stop';
}) => (
    <button
        type={'button'}
        disabled={disabled}
        onClick={onClick}
        css={[
            tw`inline-flex h-10 flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors duration-150 focus:outline-none sm:flex-none`,
            tw`disabled:cursor-not-allowed disabled:opacity-40`,
            variant === 'start' && tw`bg-green-600 text-white hover:bg-green-500 disabled:hover:bg-green-600`,
            variant === 'neutral' && tw`bg-white bg-opacity-10 text-neutral-100 hover:bg-opacity-20 disabled:hover:bg-opacity-10`,
            variant === 'stop' && tw`bg-red-600 bg-opacity-90 text-white hover:bg-red-500 disabled:hover:bg-red-600`,
        ]}
    >
        {label}
    </button>
);

const Notice = ({ children }: { children: React.ReactNode }) => (
    <p css={tw`rounded-lg bg-yellow-500 bg-opacity-10 px-4 py-3 text-sm leading-relaxed text-yellow-200`}>{children}</p>
);

export default () => {
    const [ stats, setStats ] = useState<Stats>(emptyStats);
    const [ killArmed, setKillArmed ] = useState(false);

    const status = ServerContext.useStoreState(state => state.status.value);
    const connected = ServerContext.useStoreState(state => state.socket.connected);
    const instance = ServerContext.useStoreState(state => state.socket.instance);
    const name = ServerContext.useStoreState(state => state.server.data!.name);
    const isInstalling = ServerContext.useStoreState(state => state.server.data!.isInstalling);
    const isTransferring = ServerContext.useStoreState(state => state.server.data!.isTransferring);
    const limits = ServerContext.useStoreState(state => state.server.data!.limits);
    const address = ServerContext.useStoreState(state => state.server.data!.allocations
        .filter(allocation => allocation.isDefault)
        .map(allocation => (allocation.alias || formatIp(allocation.ip)) + ':' + allocation.port)
        .toString());
    const [ canStart, canRestart, canStop ] = usePermissions([ 'control.start', 'control.restart', 'control.stop' ]);

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        const listener = (data: string) => {
            try {
                const parsed = JSON.parse(data);

                setStats({
                    memory: parsed.memory_bytes,
                    cpu: parsed.cpu_absolute,
                    disk: parsed.disk_bytes,
                    uptime: parsed.uptime || 0,
                    rx: parsed.network?.rx_bytes || 0,
                    tx: parsed.network?.tx_bytes || 0,
                });
            } catch (e) {
                // Ignore a malformed frame, the next one arrives within a second.
            }
        };

        instance.addListener(SocketEvent.STATS, listener);
        instance.send(SocketRequest.SEND_STATS);

        return () => {
            instance.removeListener(SocketEvent.STATS, listener);
        };
    }, [ instance, connected ]);

    useEffect(() => {
        setKillArmed(status === 'stopping');
    }, [ status ]);

    const sendPower = (action: PowerAction) => {
        instance && instance.send('set state', action);
    };

    const info = statusInfo(status, isInstalling, isTransferring);
    const busy = isInstalling || isTransferring;
    const showControls = !busy && (canStart || canRestart || canStop);

    const megabytes = 1024 * 1024;
    const ratio = (used: number, limit: number): number | null => (limit > 0 ? used / limit : null);

    return (
        <>
            <div css={[ card, tw`p-4 sm:p-6` ]}>
                <div css={tw`flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between`}>
                    <div css={tw`min-w-0`}>
                        <div css={tw`flex flex-wrap items-center gap-x-3 gap-y-2`}>
                            <span css={tw`inline-flex items-center gap-2 rounded-full bg-white bg-opacity-5 px-3 py-1 text-xs font-semibold text-neutral-200`}>
                                <span
                                    css={[ tw`inline-block h-2 w-2 rounded-full`, info.pulse && tw`animate-pulse` ]}
                                    style={{ background: dotColors[info.tone] }}
                                />
                                {info.label}
                            </span>
                            {stats.uptime > 0 && status === 'running' && (
                                <span css={tw`text-xs text-neutral-400`}>
                                    depuis <UptimeDuration uptime={stats.uptime / 1000}/>
                                </span>
                            )}
                        </div>

                        <h1 css={tw`mt-3 break-words font-header text-2xl font-extrabold tracking-tight text-neutral-50 sm:text-3xl`}>{name}</h1>

                        {address && (
                            <CopyOnClick text={address}>
                                <span css={tw`mt-3 inline-flex max-w-full cursor-pointer items-center gap-2.5 rounded-lg bg-white bg-opacity-5 px-3 py-2 text-sm text-neutral-200 transition-colors duration-150 hover:bg-opacity-10`}>
                                    <FontAwesomeIcon icon={faEthernet} fixedWidth css={tw`flex-shrink-0 text-neutral-500`}/>
                                    <code css={tw`truncate`}>{address}</code>
                                    <FontAwesomeIcon icon={faCopy} css={tw`flex-shrink-0 text-xs text-neutral-500`}/>
                                </span>
                            </CopyOnClick>
                        )}
                    </div>

                    {showControls && (
                        <div css={tw`flex flex-wrap gap-2 lg:flex-shrink-0 lg:justify-end`}>
                            {canStart && (
                                <PowerButton variant={'start'} label={'Démarrer'} disabled={status !== 'offline'} onClick={() => sendPower('start')}/>
                            )}
                            {canRestart && (
                                <PowerButton variant={'neutral'} label={'Redémarrer'} disabled={!status} onClick={() => sendPower('restart')}/>
                            )}
                            {canStop && (
                                <PowerButton
                                    variant={'stop'}
                                    label={killArmed ? 'Forcer l’arrêt' : 'Arrêter'}
                                    disabled={!status || status === 'offline'}
                                    onClick={() => {
                                        sendPower(killArmed ? 'kill' : 'stop');
                                        setKillArmed(true);
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>

                {isInstalling && (
                    <div css={tw`mt-5`}>
                        <Notice>Ce serveur exécute son installation : la plupart des actions sont indisponibles pour le moment.</Notice>
                    </div>
                )}
                {!isInstalling && isTransferring && (
                    <div css={tw`mt-5`}>
                        <Notice>Ce serveur est en cours de transfert vers un autre node : toutes les actions sont indisponibles.</Notice>
                    </div>
                )}
            </div>

            <div css={tw`mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4`}>
                <Metric
                    icon={faMicrochip}
                    label={'Processeur'}
                    value={`${stats.cpu.toFixed(1)} %`}
                    limit={limits.cpu ? `${limits.cpu} %` : 'illimité'}
                    ratio={ratio(stats.cpu, limits.cpu)}
                />
                <Metric
                    icon={faMemory}
                    label={'Mémoire'}
                    value={bytesToHuman(stats.memory)}
                    limit={limits.memory ? megabytesToHuman(limits.memory) : 'illimitée'}
                    ratio={ratio(stats.memory, limits.memory * megabytes)}
                />
                <Metric
                    icon={faHdd}
                    label={'Disque'}
                    value={bytesToHuman(stats.disk)}
                    limit={limits.disk ? megabytesToHuman(limits.disk) : 'illimité'}
                    ratio={ratio(stats.disk, limits.disk * megabytes)}
                />
                <Metric
                    icon={faExchangeAlt}
                    label={'Trafic réseau'}
                    value={bytesToHuman(stats.rx + stats.tx)}
                    footer={
                        <p css={tw`text-xs text-neutral-400`} style={numeric}>
                            ↓ {bytesToHuman(stats.rx)} &nbsp; ↑ {bytesToHuman(stats.tx)}
                        </p>
                    }
                />
            </div>
        </>
    );
};
