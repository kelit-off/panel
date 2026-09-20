import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faArrowDown,
    faArrowUp,
    faExclamationTriangle,
    faLifeRing,
    faMinus,
    faServer,
    faShoppingBag,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import getVersion, { VersionData } from '@/api/admin/getVersion';
import getOverview, { Overview } from '@/api/admin/getOverview';
import getAnalytics, { Analytics, Range } from '@/api/admin/getAnalytics';
import { BarList, ChartCard, LineChart, Meter, palette, Segment, SegmentedBar, Sparkline } from '@/components/admin/analytics/charts';
import { computeDelta, Delta, formatCount, formatDay, formatMoney, formatSize } from '@/components/admin/analytics/format';

type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'neutral';

const Pill = ({ tone, children }: { tone: Tone; children: React.ReactNode }) => (
    <span
        css={[
            tw`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold`,
            tone === 'green' && tw`bg-green-500 bg-opacity-20 text-green-300`,
            tone === 'yellow' && tw`bg-yellow-500 bg-opacity-20 text-yellow-300`,
            tone === 'red' && tw`bg-red-500 bg-opacity-20 text-red-300`,
            tone === 'blue' && tw`bg-blue-500 bg-opacity-20 text-blue-300`,
            tone === 'neutral' && tw`bg-white bg-opacity-10 text-neutral-300`,
        ]}
    >
        {children}
    </span>
);

const ticketStatuses: Record<string, { label: string; tone: Tone }> = {
    open: { label: 'Ouvert', tone: 'yellow' },
    answered: { label: 'Répondu', tone: 'green' },
    'customer-reply': { label: 'Client a répondu', tone: 'red' },
    closed: { label: 'Fermé', tone: 'neutral' },
};

const orderStatuses: Record<string, { label: string; tone: Tone }> = {
    pending: { label: 'En attente de paiement', tone: 'neutral' },
    paid: { label: 'Payée', tone: 'blue' },
    active: { label: 'Serveur créé', tone: 'green' },
    failed: { label: 'Échec de création', tone: 'red' },
    suspended: { label: 'Suspendue', tone: 'yellow' },
    cancelled: { label: 'Résiliée', tone: 'neutral' },
    terminated: { label: 'Supprimée', tone: 'neutral' },
};

const ranges: { value: Range; label: string }[] = [
    { value: 7, label: '7 jours' },
    { value: 30, label: '30 jours' },
    { value: 90, label: '90 jours' },
];

const card = tw`rounded-xl border border-white border-opacity-5 bg-neutral-800`;

const Panel = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <div css={[ card, tw`overflow-hidden` ]}>
        <div css={tw`flex items-center justify-between border-b border-white border-opacity-5 px-5 py-4`}>
            <h3 css={tw`font-header text-sm font-bold text-neutral-100`}>{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
    <p css={tw`px-5 py-8 text-center text-sm text-neutral-500`}>{children}</p>
);

const DeltaBadge = ({ delta, upIsGood }: { delta: Delta; upIsGood: boolean }) => {
    const good = delta.direction === 'flat' ? null : (delta.direction === 'up') === upIsGood;
    const color = good === null ? palette.neutral : good ? palette.good : palette.critical;

    return (
        <span css={tw`inline-flex items-center gap-1.5 text-xs text-neutral-300`}>
            <FontAwesomeIcon
                icon={delta.direction === 'up' ? faArrowUp : delta.direction === 'down' ? faArrowDown : faMinus}
                style={{ color }}
                css={tw`text-2xs`}
            />
            <strong css={tw`font-semibold text-neutral-100`}>{delta.label}</strong>
            <span css={tw`text-neutral-500`}>vs période précédente</span>
        </span>
    );
};

const Kpi = ({ label, value, current, previous, upIsGood = true, spark }: {
    label: string;
    value: string;
    current: number;
    previous: number;
    upIsGood?: boolean;
    spark?: number[];
}) => (
    <div css={[ card, tw`flex flex-col justify-between p-5` ]}>
        <p css={tw`text-xs font-semibold uppercase tracking-wider text-neutral-400`}>{label}</p>
        <div css={tw`mt-3 flex items-end justify-between gap-3`}>
            <p css={tw`font-header text-3xl font-extrabold leading-none text-neutral-50`}>{value}</p>
            {spark && <Sparkline values={spark}/>}
        </div>
        <div css={tw`mt-3`}>
            <DeltaBadge delta={computeDelta(current, previous)} upIsGood={upIsGood}/>
        </div>
    </div>
);

const QuickLink = ({ icon, label, value, to, alert }: { icon: IconDefinition; label: string; value: number; to: string; alert?: boolean }) => (
    <Link to={to} css={[ card, tw`flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-white hover:bg-opacity-5` ]}>
        <span
            css={[
                tw`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg`,
                alert ? tw`bg-yellow-500 bg-opacity-20 text-yellow-400` : tw`bg-blue-500 bg-opacity-20 text-blue-400`,
            ]}
        >
            <FontAwesomeIcon icon={icon}/>
        </span>
        <span>
            <span css={tw`block font-header text-lg font-extrabold leading-none text-neutral-50`}>{formatCount(value)}</span>
            <span css={tw`mt-1 block text-xs text-neutral-400`}>{label}</span>
        </span>
    </Link>
);

const statusSegments = (statuses: Record<string, number>): Segment[] => [
    { key: 'active', label: 'Actifs', value: statuses.active || 0, color: palette.good },
    { key: 'suspended', label: 'Suspendus (impayé)', value: statuses.suspended || 0, color: palette.warning },
    { key: 'failed', label: 'Création en échec', value: statuses.failed || 0, color: palette.critical },
    { key: 'progress', label: 'En attente ou en création', value: (statuses.pending || 0) + (statuses.paid || 0), color: palette.series[0] },
    { key: 'ended', label: 'Résiliés ou supprimés', value: (statuses.cancelled || 0) + (statuses.terminated || 0), color: palette.neutral },
];

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ overview, setOverview ] = useState<Overview | undefined>();
    const [ version, setVersion ] = useState<VersionData | undefined>();
    const [ analytics, setAnalytics ] = useState<Analytics | undefined>();
    const [ range, setRange ] = useState<Range>(30);
    const [ loading, setLoading ] = useState(true);
    const latestRange = useRef(range);

    useEffect(() => {
        clearFlashes('overview');

        getOverview()
            .then(setOverview)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'overview', error });
            });

        getVersion().then(setVersion).catch(console.error);
    }, []);

    useEffect(() => {
        latestRange.current = range;
        setLoading(true);

        getAnalytics(range)
            .then(result => latestRange.current === range && setAnalytics(result))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'overview', error });
            })
            .then(() => latestRange.current === range && setLoading(false));
    }, [ range ]);

    const k = analytics?.kpis;
    const series = analytics?.series || [];
    const rangeLabel = `${range} derniers jours`;

    return (
        <AdminContentBlock title={'Vue d\'ensemble'}>
            <div css={tw`mb-6 flex flex-wrap items-end justify-between gap-4`}>
                <div>
                    <h2 css={tw`font-header text-2xl font-extrabold tracking-tight text-neutral-50`}>Vue d&apos;ensemble</h2>
                    <p css={tw`mt-1 text-base text-neutral-400`}>L&apos;activité et la santé de votre hébergement.</p>
                </div>

                <div css={tw`inline-flex rounded-lg border border-white border-opacity-10 bg-neutral-800 p-1`} role={'group'} aria-label={'Période analysée'}>
                    {ranges.map(option => (
                        <button
                            key={option.value}
                            type={'button'}
                            aria-pressed={range === option.value}
                            onClick={() => setRange(option.value)}
                            css={[
                                tw`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150`,
                                range === option.value
                                    ? tw`bg-primary-600 text-white`
                                    : tw`text-neutral-400 hover:bg-white hover:bg-opacity-10 hover:text-neutral-100`,
                            ]}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <FlashMessageRender byKey={'overview'} css={tw`mb-4`}/>

            {!overview || !analytics || !k ? (
                <div css={tw`flex w-full items-center justify-center`} style={{ height: '16rem' }}>
                    <Spinner size={'base'}/>
                </div>
            ) : (
                <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
                    {overview.counts.ordersFailed > 0 && (
                        <div css={tw`mb-6 flex items-center gap-3 rounded-xl border border-red-500 border-opacity-30 bg-red-500 bg-opacity-10 px-5 py-4 text-sm text-red-200`}>
                            <FontAwesomeIcon icon={faExclamationTriangle}/>
                            <span>
                                {overview.counts.ordersFailed} commande(s) payée(s) n&apos;ont pas pu créer leur serveur automatiquement — une intervention manuelle est nécessaire.
                            </span>
                        </div>
                    )}

                    <div css={tw`grid grid-cols-1 gap-4 lg:grid-cols-3`}>
                        <div css={[ card, tw`flex flex-col justify-between p-6` ]}>
                            <div>
                                <p css={tw`text-xs font-semibold uppercase tracking-wider text-neutral-400`}>Revenu mensuel récurrent</p>
                                <p css={tw`mt-3 font-header font-extrabold leading-none text-neutral-50`} style={{ fontSize: '3.25rem' }}>
                                    {formatMoney(k.mrr)}
                                </p>
                                <p css={tw`mt-3 text-sm text-neutral-300`}>
                                    {formatCount(k.servicesActive)} service{k.servicesActive > 1 ? 's' : ''} actif{k.servicesActive > 1 ? 's' : ''}
                                    {k.averageRevenuePerCustomer > 0 && <> &middot; {formatMoney(k.averageRevenuePerCustomer)} par client</>}
                                </p>
                            </div>
                            <div css={tw`mt-6`}>
                                {k.mrrAtRisk > 0 ? (
                                    <div css={tw`flex items-start gap-2.5 rounded-lg bg-yellow-500 bg-opacity-10 px-3.5 py-3 text-sm text-yellow-200`}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} css={tw`mt-0.5 text-yellow-400`}/>
                                        <span>
                                            <strong>{formatMoney(k.mrrAtRisk)}</strong> à risque : {k.servicesSuspended} service{k.servicesSuspended > 1 ? 's' : ''} suspendu{k.servicesSuspended > 1 ? 's' : ''} pour impayé.
                                        </span>
                                    </div>
                                ) : (
                                    <p css={tw`text-xs text-neutral-500`}>Aucun impayé en cours.</p>
                                )}
                                <p css={tw`mt-3 text-xs text-neutral-500`}>Estimé d&apos;après le prix des offres vendues. Stripe reste la référence pour les encaissements.</p>
                            </div>
                        </div>

                        <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2`}>
                            <Kpi
                                label={'Ventes'}
                                value={formatMoney(k.sold)}
                                current={k.sold}
                                previous={k.soldPrevious}
                                spark={series.map(point => point.sold)}
                            />
                            <Kpi
                                label={'Commandes'}
                                value={formatCount(k.orders)}
                                current={k.orders}
                                previous={k.ordersPrevious}
                                spark={series.map(point => point.orders)}
                            />
                            <Kpi
                                label={'Nouveaux clients'}
                                value={formatCount(k.customers)}
                                current={k.customers}
                                previous={k.customersPrevious}
                                spark={series.map(point => point.customers)}
                            />
                            <Kpi
                                label={'Résiliations'}
                                value={formatCount(k.ended)}
                                current={k.ended}
                                previous={k.endedPrevious}
                                upIsGood={false}
                            />
                        </div>
                    </div>

                    <div css={tw`mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4`}>
                        <QuickLink icon={faUsers} label={'Clients'} value={overview.counts.customers} to={'/admin/users'}/>
                        <QuickLink icon={faServer} label={'Serveurs'} value={overview.counts.servers} to={'/admin/servers'}/>
                        <QuickLink icon={faShoppingBag} label={'Offres actives'} value={overview.counts.products} to={'/admin/products'}/>
                        <QuickLink icon={faLifeRing} label={'Tickets à traiter'} value={k.ticketsWaiting} to={'/admin/tickets'} alert={k.ticketsWaiting > 0}/>
                    </div>

                    <div css={tw`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3`}>
                        <ChartCard
                            css={tw`lg:col-span-2`}
                            title={'Ventes par jour'}
                            subtitle={`Abonnements vendus, en € par mois · ${rangeLabel}`}
                            table={{
                                columns: [ 'Date', 'Ventes', 'Commandes' ],
                                rows: series.map(p => [ formatDay(p.date), formatMoney(p.sold), p.orders ]),
                            }}
                        >
                            <LineChart
                                area
                                data={series}
                                series={[ { key: 'sold', name: 'Ventes', color: palette.series[0] } ]}
                                formatValue={formatMoney}
                            />
                        </ChartCard>

                        <ChartCard
                            title={'Revenu par offre'}
                            subtitle={'Revenu mensuel des services actifs'}
                            table={{
                                columns: [ 'Offre', 'Services', 'Revenu' ],
                                rows: analytics.byProduct.map(p => [ p.name, p.services, formatMoney(p.mrr) ]),
                            }}
                        >
                            {analytics.byProduct.length === 0 ? (
                                <p css={tw`py-10 text-center text-sm text-neutral-500`}>Aucun service actif.</p>
                            ) : (
                                <BarList
                                    rows={analytics.byProduct.map(p => ({
                                        label: p.name,
                                        value: p.mrr,
                                        sub: `${p.services} service${p.services > 1 ? 's' : ''}`,
                                    }))}
                                    formatValue={formatMoney}
                                />
                            )}
                        </ChartCard>

                        <ChartCard
                            css={tw`lg:col-span-2`}
                            title={'Clients et commandes'}
                            subtitle={`Nouveaux comptes et commandes payées par jour · ${rangeLabel}`}
                            legend={[
                                { key: 'customers', name: 'Nouveaux clients', color: palette.series[0] },
                                { key: 'orders', name: 'Commandes', color: palette.series[1] },
                            ]}
                            table={{
                                columns: [ 'Date', 'Nouveaux clients', 'Commandes' ],
                                rows: series.map(p => [ formatDay(p.date), p.customers, p.orders ]),
                            }}
                        >
                            <LineChart
                                data={series}
                                series={[
                                    { key: 'customers', name: 'Nouveaux clients', color: palette.series[0] },
                                    { key: 'orders', name: 'Commandes', color: palette.series[1] },
                                ]}
                                formatValue={formatCount}
                            />
                        </ChartCard>

                        <ChartCard title={'État des services'} subtitle={'Toutes les commandes'}>
                            <SegmentedBar segments={statusSegments(analytics.orderStatuses)}/>
                        </ChartCard>

                        <ChartCard
                            css={tw`lg:col-span-3`}
                            title={'Capacité des nodes'}
                            subtitle={'Ressources allouées aux serveurs, sur-allocation comprise dans la limite'}
                        >
                            {analytics.nodes.length === 0 ? (
                                <p css={tw`py-6 text-center text-sm text-neutral-500`}>Aucun node configuré.</p>
                            ) : (
                                <div css={tw`grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2`}>
                                    {analytics.nodes.map(node => (
                                        <div key={node.id}>
                                            <div css={tw`mb-3 flex items-baseline justify-between`}>
                                                <Link to={`/admin/nodes/${node.id}`} css={tw`text-sm font-semibold text-neutral-100 hover:text-primary-300`}>{node.name}</Link>
                                                <span css={tw`text-xs text-neutral-400`}>{node.servers} serveur{node.servers > 1 ? 's' : ''}</span>
                                            </div>
                                            <div css={tw`space-y-3`}>
                                                <Meter label={'Mémoire'} used={node.memory.used} limit={node.memory.limit} format={formatSize}/>
                                                <Meter label={'Disque'} used={node.disk.used} limit={node.disk.limit} format={formatSize}/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ChartCard>
                    </div>

                    <div css={tw`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2`}>
                        <Panel title={'Derniers tickets'} action={<Link to={'/admin/tickets'} css={tw`text-xs font-semibold text-blue-400 hover:text-blue-300`}>Tout voir</Link>}>
                            {overview.recentTickets.length === 0 ? <Empty>Aucun ticket pour le moment.</Empty> : (
                                <ul>
                                    {overview.recentTickets.map(ticket => {
                                        const status = ticketStatuses[ticket.status] || { label: ticket.status, tone: 'neutral' as Tone };

                                        return (
                                            <li key={ticket.id} css={tw`border-b border-white border-opacity-5 last:border-0`}>
                                                <Link to={`/admin/tickets/${ticket.id}`} css={tw`flex items-center gap-4 px-5 py-3.5 hover:bg-white hover:bg-opacity-5`}>
                                                    <div css={tw`min-w-0 flex-1`}>
                                                        <p css={tw`truncate text-sm font-semibold text-neutral-100`}>{ticket.subject}</p>
                                                        <p css={tw`truncate text-xs text-neutral-500`}>{ticket.customer || 'Client inconnu'}</p>
                                                    </div>
                                                    <Pill tone={status.tone}>{status.label}</Pill>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </Panel>

                        <Panel title={'Dernières commandes'}>
                            {overview.recentOrders.length === 0 ? <Empty>Aucune commande pour le moment.</Empty> : (
                                <ul>
                                    {overview.recentOrders.map(order => {
                                        const status = orderStatuses[order.status] || { label: order.status, tone: 'neutral' as Tone };

                                        return (
                                            <li key={order.id} css={tw`flex items-center gap-4 border-b border-white border-opacity-5 px-5 py-3.5 last:border-0`}>
                                                <div css={tw`min-w-0 flex-1`}>
                                                    <p css={tw`truncate text-sm font-semibold text-neutral-100`}>{order.product || 'Offre supprimée'}</p>
                                                    <p css={tw`truncate text-xs text-neutral-500`}>{order.customer || 'Client inconnu'} &middot; {order.createdAt.toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <Pill tone={status.tone}>{status.label}</Pill>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </Panel>
                    </div>

                    {version && (
                        <p css={tw`mt-8 text-center text-xs text-neutral-500`}>
                            Pterodactyl {version.panel.current}
                            {version.panel.current !== 'canary' && version.panel.latest !== version.panel.current && ` — version ${version.panel.latest} disponible`}
                        </p>
                    )}
                </div>
            )}
        </AdminContentBlock>
    );
};
