import React, { useCallback, useState } from 'react';
import Chart, { ChartConfiguration } from 'chart.js';
import { ServerContext } from '@/state/server';
import { bytesToMegabytes } from '@/helpers';
import merge from 'deepmerge';
import { faMemory, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import tw from 'twin.macro';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';

const chartDefaults = (ticks?: Chart.TickOptions | undefined): ChartConfiguration => ({
    type: 'line',
    options: {
        legend: {
            display: false,
        },
        tooltips: {
            enabled: false,
        },
        animation: {
            duration: 0,
        },
        elements: {
            point: {
                radius: 0,
            },
            line: {
                tension: 0.3,
                borderWidth: 2,
                backgroundColor: 'rgba(61, 220, 151, 0.18)',
                borderColor: '#3ddc97',
            },
        },
        scales: {
            xAxes: [ {
                ticks: {
                    display: false,
                },
                gridLines: {
                    display: false,
                },
            } ],
            yAxes: [ {
                gridLines: {
                    drawTicks: false,
                    color: 'rgba(229, 232, 235, 0.08)',
                    zeroLineColor: 'rgba(61, 220, 151, 0.4)',
                    zeroLineWidth: 2,
                },
                ticks: merge(ticks || {}, {
                    fontSize: 10,
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontColor: 'rgb(156, 163, 175)',
                    min: 0,
                    beginAtZero: true,
                    maxTicksLimit: 5,
                }),
            } ],
        },
    },
    data: {
        labels: Array(20).fill(''),
        datasets: [
            {
                fill: true,
                data: Array(20).fill(0),
            },
        ],
    },
});

const GraphCard = ({ title, icon, current, children }: {
    title: string;
    icon: IconDefinition;
    current?: string;
    children: React.ReactNode;
}) => (
    <section css={tw`overflow-hidden rounded-xl border border-white border-opacity-5 bg-neutral-900`}>
        <header css={tw`flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5`}>
            <h3 css={tw`flex items-center gap-2 text-xs font-semibold text-neutral-400`}>
                <FontAwesomeIcon icon={icon} fixedWidth css={tw`text-neutral-500`}/>
                {title}
            </h3>
            {current && <span css={tw`font-header text-sm font-bold text-neutral-50`} style={{ fontVariantNumeric: 'tabular-nums' }}>{current}</span>}
        </header>
        <div css={tw`px-4 pb-4 pt-3 sm:px-5 sm:pb-5`}>{children}</div>
    </section>
);

export default () => {
    const status = ServerContext.useStoreState(state => state.status.value);
    const limits = ServerContext.useStoreState(state => state.server.data!.limits);

    const [ memory, setMemory ] = useState<Chart>();
    const [ cpu, setCpu ] = useState<Chart>();
    const [ latest, setLatest ] = useState({ memory: 0, cpu: 0 });

    const memoryRef = useCallback<(node: HTMLCanvasElement | null) => void>(node => {
        if (!node) {
            return;
        }

        setMemory(
            new Chart(node.getContext('2d')!, chartDefaults({
                callback: (value) => `${value} Mo  `,
                suggestedMax: limits.memory,
            })),
        );
    }, []);

    const cpuRef = useCallback<(node: HTMLCanvasElement | null) => void>(node => {
        if (!node) {
            return;
        }

        setCpu(
            new Chart(node.getContext('2d')!, chartDefaults({
                callback: (value) => `${value} %  `,
                suggestedMax: limits.cpu,
            })),
        );
    }, []);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setLatest({ memory: bytesToMegabytes(stats.memory_bytes), cpu: stats.cpu_absolute });

        if (memory && memory.data.datasets) {
            const data = memory.data.datasets[0].data!;

            data.push(bytesToMegabytes(stats.memory_bytes));
            data.shift();

            memory.update({ lazy: true });
        }

        if (cpu && cpu.data.datasets) {
            const data = cpu.data.datasets[0].data!;

            data.push(stats.cpu_absolute);
            data.shift();

            cpu.update({ lazy: true });
        }
    });

    const offline = status === 'offline';

    return (
        <div css={tw`mt-4 grid grid-cols-1 gap-4 md:grid-cols-2`}>
            <GraphCard title={'Utilisation de la mémoire'} icon={faMemory} current={offline ? undefined : `${latest.memory.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} Mo`}>
                {!offline ?
                    <canvas
                        id={'memory_chart'}
                        ref={memoryRef}
                        aria-label={'Graphique d’utilisation de la mémoire du serveur'}
                        role={'img'}
                    />
                    :
                    <p css={tw`py-8 text-center text-sm text-neutral-500`}>Le serveur est hors ligne.</p>
                }
            </GraphCard>
            <GraphCard title={'Utilisation du processeur'} icon={faMicrochip} current={offline ? undefined : `${latest.cpu.toFixed(1)} %`}>
                {!offline ?
                    <canvas id={'cpu_chart'} ref={cpuRef} aria-label={'Graphique d’utilisation du processeur du serveur'} role={'img'}/>
                    :
                    <p css={tw`py-8 text-center text-sm text-neutral-500`}>Le serveur est hors ligne.</p>
                }
            </GraphCard>
        </div>
    );
};
