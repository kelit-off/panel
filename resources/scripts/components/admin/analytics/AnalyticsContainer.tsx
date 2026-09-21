import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import {
    BusinessRange,
    CapacityAnalytics,
    CustomerAnalytics,
    FunnelAnalytics,
    getCapacityAnalytics,
    getCustomerAnalytics,
    getFunnelAnalytics,
    getRevenueAnalytics,
    RevenueAnalytics,
} from '@/api/admin/analytics';
import { BarList, ChartCard, DivergingBars, LineChart, Meter, palette } from '@/components/admin/analytics/charts';
import { computeDelta, Delta, formatCount, formatMoney, formatMonth, formatPercent, formatSize } from '@/components/admin/analytics/format';

type Tab = 'revenue' | 'customers' | 'funnel' | 'capacity';

const tabs: { value: Tab; label: string; hint: string }[] = [
    { value: 'revenue', label: 'Revenus', hint: 'MRR, churn et valeur client' },
    { value: 'customers', label: 'Clients', hint: 'Acquisition et fidélité' },
    { value: 'funnel', label: 'Conversion', hint: 'De la visite au paiement' },
    { value: 'capacity', label: 'Capacité', hint: 'Infrastructure et rentabilité' },
];

const ranges: { value: BusinessRange; label: string }[] = [
    { value: 7, label: '7 jours' },
    { value: 30, label: '30 jours' },
    { value: 90, label: '90 jours' },
    { value: 365, label: '12 mois' },
];

const card = tw`rounded-xl border border-white border-opacity-5 bg-neutral-800`;
const numeric = { fontVariantNumeric: 'tabular-nums' } as const;

function useAnalytics<T> (load: () => Promise<T>, deps: unknown[]) {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ data, setData ] = useState<T | undefined>();
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        clearFlashes('analytics');

        load()
            .then(result => !cancelled && setData(result))
            .catch(error => {
                console.error(error);
                !cancelled && clearAndAddHttpError({ key: 'analytics', error });
            })
            .then(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, deps);

    return { data, loading };
}

const Loader = () => (
    <div css={tw`flex w-full items-center justify-center`} style={{ height: '16rem' }}>
        <Spinner size={'base'}/>
    </div>
);

const Trend = ({ delta, upIsGood = true }: { delta: Delta; upIsGood?: boolean }) => {
    const good = delta.direction === 'flat' ? null : (delta.direction === 'up') === upIsGood;
    const color = good === null ? palette.neutral : good ? palette.good : palette.critical;

    return (
        <span css={tw`inline-flex items-center gap-1.5 text-xs text-neutral-300`}>
            <FontAwesomeIcon icon={delta.direction === 'up' ? faArrowUp : delta.direction === 'down' ? faArrowDown : faMinus} style={{ color }} css={tw`text-2xs`}/>
            <strong css={tw`font-semibold text-neutral-100`}>{delta.label}</strong>
            <span css={tw`text-neutral-500`}>vs période précédente</span>
        </span>
    );
};

const Stat = ({ label, value, hint, children, large }: {
    label: string;
    value: string;
    hint?: string;
    children?: React.ReactNode;
    large?: boolean;
}) => (
    <div css={[ card, tw`flex flex-col justify-between p-5` ]}>
        <div>
            <p css={tw`text-xs font-semibold uppercase tracking-wider text-neutral-400`}>{label}</p>
            <p css={[ tw`mt-3 font-header font-extrabold leading-none text-neutral-50`, large ? tw`text-4xl` : tw`text-2xl` ]} style={numeric}>{value}</p>
        </div>
        <div css={tw`mt-3 min-h-[1rem]`}>
            {children}
            {hint && <p css={tw`text-xs leading-snug text-neutral-400`}>{hint}</p>}
        </div>
    </div>
);

type Tone = 'good' | 'warning' | 'critical' | 'info';

const toneColors: Record<Tone, string> = {
    good: palette.good,
    warning: palette.warning,
    critical: palette.critical,
    info: palette.series[0],
};

const Insights = ({ items }: { items: { tone: Tone; text: React.ReactNode }[] }) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <ul css={tw`mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2`}>
            {items.map((item, i) => (
                <li
                    key={i}
                    css={[ card, tw`px-4 py-3 text-sm leading-relaxed text-neutral-200` ]}
                    style={{ borderLeft: `3px solid ${toneColors[item.tone]}` }}
                >
                    {item.text}
                </li>
            ))}
        </ul>
    );
};

const DataTable = ({ columns, rows, empty }: { columns: string[]; rows: React.ReactNode[][]; empty: string }) => (
    rows.length === 0 ? (
        <p css={tw`py-8 text-center text-sm text-neutral-500`}>{empty}</p>
    ) : (
        <div css={tw`overflow-x-auto`}>
            <table css={tw`w-full text-left text-sm`}>
                <thead>
                    <tr>
                        {columns.map((column, i) => (
                            <th key={column} css={[ tw`whitespace-nowrap pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-neutral-400`, i > 0 && tw`text-right` ]}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} css={tw`border-t border-white border-opacity-5`}>
                            {row.map((cell, j) => (
                                <td key={j} css={[ tw`whitespace-nowrap py-2.5 pr-4 text-neutral-200`, j > 0 && tw`text-right` ]} style={numeric}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
);

const aiPurposes: Record<string, string> = { training: 'Entraînement', search: 'Recherche', user: 'À la demande' };

const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

const RevenueTab = ({ range }: { range: BusinessRange }) => {
    const { data, loading } = useAnalytics<RevenueAnalytics>(() => getRevenueAnalytics(range), [ range ]);

    if (!data) {
        return <Loader/>;
    }

    const k = data.kpis;
    const topCustomer = data.topCustomers[0];
    const topGame = data.byGame[0];
    const insights: { tone: Tone; text: React.ReactNode }[] = [];

    if (k.customerChurn !== null && k.customerChurn > 0) {
        insights.push({
            tone: k.customerChurn > 10 ? 'critical' : k.customerChurn > 5 ? 'warning' : 'good',
            text: <>Vous perdez environ <strong>{formatPercent(k.customerChurn)}</strong> de vos clients par mois, soit <strong>{formatMoney(k.churnedMrr)}</strong> de revenu récurrent sur la période. Un client reste en moyenne {k.lifetimeMonths?.toLocaleString('fr-FR')} mois.</>,
        });
    }
    if (k.mrrAtRisk > 0) {
        insights.push({
            tone: 'warning',
            text: <><strong>{formatMoney(k.mrrAtRisk)}</strong> de revenu mensuel est suspendu pour impayé. Relancer ces clients est le gain le plus rapide.</>,
        });
    }
    if (topCustomer && k.mrr > 0 && topCustomer.share >= 25 && data.topCustomers.length > 1) {
        insights.push({
            tone: 'warning',
            text: <><strong>{topCustomer.name}</strong> représente {formatPercent(topCustomer.share, 0)} de votre revenu récurrent : sa perte pèserait lourd.</>,
        });
    }
    if (topGame && data.byGame.length > 1 && topGame.share >= 70) {
        insights.push({
            tone: 'info',
            text: <><strong>{topGame.name}</strong> génère {formatPercent(topGame.share, 0)} du revenu : l&apos;activité dépend d&apos;un seul jeu.</>,
        });
    }
    if (k.mrrGrowth !== null && k.mrrGrowth > 0) {
        insights.push({
            tone: 'good',
            text: <>Le revenu récurrent progresse de <strong>{formatPercent(k.mrrGrowth)}</strong> sur la période ({formatMoney(k.mrrStart)} à {formatMoney(k.mrr)}).</>,
        });
    }

    const rangeLabel = ranges.find(option => option.value === range)!.label.toLowerCase();

    return (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
            <Insights items={insights}/>

            <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
                <Stat label={'Revenu mensuel récurrent'} value={formatMoney(k.mrr)} large hint={`${formatCount(k.services)} ${plural(k.services, 'service actif', 'services actifs')}`}>
                    {k.mrrGrowth !== null && (
                        <p css={tw`mb-1 text-xs font-semibold`} style={{ color: k.mrrGrowth >= 0 ? palette.good : palette.critical }}>
                            {k.mrrGrowth > 0 ? '+' : ''}{formatPercent(k.mrrGrowth)} sur {rangeLabel}
                        </p>
                    )}
                </Stat>
                <Stat label={'Revenu annuel projeté'} value={formatMoney(k.arr)} hint={'MRR actuel multiplié par 12'}/>
                <Stat label={'Revenu par client'} value={formatMoney(k.arpu)} hint={`${formatCount(k.payingCustomers)} ${plural(k.payingCustomers, 'client payant', 'clients payants')}`}/>
                <Stat
                    label={'Valeur vie client'}
                    value={k.ltv === null ? '—' : formatMoney(k.ltv)}
                    hint={k.ltv === null ? 'Disponible dès la première perte de client' : 'Revenu attendu d’un client sur toute sa durée'}
                />
            </div>

            <div css={tw`mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
                <Stat label={'Perte de clients / mois'} value={formatPercent(k.customerChurn)} hint={'Part des clients perdus, ramenée à 30 jours'}/>
                <Stat label={'Perte de revenu / mois'} value={formatPercent(k.revenueChurn)} hint={'Part du MRR de départ perdue sur la période'}/>
                <Stat label={'Revenu gagné'} value={formatMoney(k.newMrr)} hint={'Nouveaux services payés sur la période'}/>
                <Stat label={'Revenu perdu'} value={formatMoney(k.churnedMrr)} hint={'Services résiliés ou suspendus sur la période'}/>
            </div>

            <div css={tw`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3`}>
                <ChartCard
                    css={tw`lg:col-span-2`}
                    title={'Évolution du revenu récurrent'}
                    subtitle={`MRR à la fin de chaque jour · ${rangeLabel}`}
                    table={{
                        columns: [ 'Date', 'MRR' ],
                        rows: data.series.map(p => [ p.date.toLocaleDateString('fr-FR'), formatMoney(p.mrr) ]),
                    }}
                >
                    <LineChart area data={data.series} series={[ { key: 'mrr', name: 'MRR', color: palette.series[0] } ]} formatValue={formatMoney}/>
                </ChartCard>

                <ChartCard title={'Mouvements de revenu'} subtitle={'Gagné au-dessus, perdu en dessous'}>
                    <DivergingBars
                        data={data.series.map(p => ({ date: p.date, up: p.new, down: p.churned }))}
                        upLabel={'gagné'}
                        downLabel={'perdu'}
                        formatValue={formatMoney}
                    />
                </ChartCard>

                <ChartCard title={'Revenu par jeu'} subtitle={'Services actifs'}>
                    {data.byGame.length === 0 ? (
                        <p css={tw`py-10 text-center text-sm text-neutral-500`}>Aucun service actif.</p>
                    ) : (
                        <BarList
                            rows={data.byGame.map(row => ({ label: row.name, value: row.mrr, sub: `${formatPercent(row.share, 0)} · ${row.services} ${plural(row.services, 'service', 'services')}` }))}
                            formatValue={formatMoney}
                        />
                    )}
                </ChartCard>

                <ChartCard title={'Revenu par offre'} subtitle={'Services actifs'}>
                    {data.byProduct.length === 0 ? (
                        <p css={tw`py-10 text-center text-sm text-neutral-500`}>Aucun service actif.</p>
                    ) : (
                        <BarList
                            color={palette.series[1]}
                            rows={data.byProduct.map(row => ({ label: row.name, value: row.mrr, sub: `${formatPercent(row.share, 0)} · ${row.services} ${plural(row.services, 'service', 'services')}` }))}
                            formatValue={formatMoney}
                        />
                    )}
                </ChartCard>

                <ChartCard title={'Meilleurs clients'} subtitle={'Par revenu mensuel'}>
                    <DataTable
                        columns={[ 'Client', 'MRR', 'Part' ]}
                        empty={'Aucun client payant.'}
                        rows={data.topCustomers.map(c => [
                            <span key={c.id} css={tw`block max-w-[10rem] truncate text-left`} title={c.email || undefined}>{c.name}</span>,
                            formatMoney(c.mrr),
                            formatPercent(c.share, 0),
                        ])}
                    />
                </ChartCard>
            </div>

            <p css={tw`mt-6 text-xs text-neutral-500`}>
                Montants estimés d&apos;après le prix actuel des offres vendues. Stripe reste la référence pour les encaissements.
            </p>
        </div>
    );
};

const retentionColor = (value: number): string => `rgba(57, 135, 229, ${(0.12 + (value / 100) * 0.7).toFixed(2)})`;

const CustomersTab = ({ range }: { range: BusinessRange }) => {
    const { data, loading } = useAnalytics<CustomerAnalytics>(() => getCustomerAnalytics(range), [ range ]);

    if (!data) {
        return <Loader/>;
    }

    const k = data.kpis;
    const insights: { tone: Tone; text: React.ReactNode }[] = [];

    if (k.activationRate !== null && k.newCustomers >= 5) {
        insights.push({
            tone: k.activationRate < 30 ? 'warning' : 'good',
            text: <><strong>{formatPercent(k.activationRate, 0)}</strong> des nouveaux comptes ont acheté. {k.activationRate < 30 ? 'Une relance après inscription peut convertir les autres.' : 'Le parcours d’inscription à la commande fonctionne bien.'}</>,
        });
    }
    if (k.provisioningFailures > 0) {
        insights.push({
            tone: 'critical',
            text: <><strong>{k.provisioningFailures}</strong> {plural(k.provisioningFailures, 'client a payé', 'clients ont payé')} sans recevoir de serveur ({formatPercent(k.provisioningFailureRate)} des commandes). C&apos;est le risque de résiliation et de litige le plus élevé.</>,
        });
    }
    if (k.multiServiceRate !== null && k.payingCustomers >= 5) {
        insights.push({
            tone: 'info',
            text: <><strong>{formatPercent(k.multiServiceRate, 0)}</strong> des clients payants ont plusieurs services. Proposer un second serveur est un levier de croissance sans nouveau client à trouver.</>,
        });
    }

    const columns = data.cohorts[0]?.retention.length ?? 0;

    return (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
            <Insights items={insights}/>

            <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
                <Stat label={'Nouveaux clients'} value={formatCount(k.newCustomers)} hint={`${formatCount(k.customersTotal)} comptes clients au total`}>
                    <div css={tw`mb-1`}><Trend delta={computeDelta(k.newCustomers, k.newCustomersPrevious)}/></div>
                </Stat>
                <Stat label={'Comptes devenus clients'} value={formatPercent(k.activationRate, 0)} hint={'Nouveaux comptes ayant passé commande'}/>
                <Stat label={'Clients payants'} value={formatCount(k.payingCustomers)} hint={k.servicesPerCustomer === null ? undefined : `${k.servicesPerCustomer.toLocaleString('fr-FR')} services par client`}/>
                <Stat label={'Clients multi-services'} value={formatPercent(k.multiServiceRate, 0)} hint={'Part des clients avec 2 services ou plus'}/>
            </div>

            <div css={[ card, tw`mt-6 p-5` ]}>
                <h3 css={tw`font-header text-sm font-bold text-neutral-100`}>Fidélité par mois d&apos;acquisition</h3>
                <p css={tw`mt-0.5 text-xs text-neutral-400`}>
                    Part des clients d&apos;un même mois qui ont encore un service actif, mois après mois. Une ligne qui reste haute signale un produit qui fidélise.
                </p>

                <div css={tw`mt-4 overflow-x-auto`}>
                    <table css={tw`w-full text-left text-sm`} style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
                        <thead>
                            <tr>
                                <th css={tw`pb-1 pr-3 text-xs font-semibold text-neutral-400`}>Arrivés en</th>
                                <th css={tw`pb-1 pr-3 text-right text-xs font-semibold text-neutral-400`}>Clients</th>
                                {Array.from({ length: columns }, (_, i) => (
                                    <th key={i} css={tw`pb-1 text-center text-xs font-semibold text-neutral-400`}>{i === 0 ? 'Mois 0' : `+${i}`}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.cohorts.map(row => (
                                <tr key={row.cohort}>
                                    <td css={tw`whitespace-nowrap pr-3 text-neutral-200`}>{formatMonth(row.cohort)}</td>
                                    <td css={tw`pr-3 text-right text-neutral-300`} style={numeric}>{row.size}</td>
                                    {Array.from({ length: columns }, (_, i) => {
                                        const value = row.retention[i];

                                        return (
                                            <td
                                                key={i}
                                                css={tw`rounded text-center text-xs font-semibold text-neutral-50`}
                                                style={{ ...numeric, minWidth: 56, height: 32, background: value === undefined || value === null ? 'transparent' : retentionColor(value) }}
                                            >
                                                {value === undefined || value === null ? '' : `${Math.round(value)} %`}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const stageRows = (stages: FunnelAnalytics['stages']) => {
    const steps = [
        { label: 'Visiteurs de la vitrine', value: stages.visitors },
        { label: 'Ont consulté un jeu', value: stages.games },
        { label: 'Ont ouvert une commande', value: stages.checkout },
        { label: 'Commandes lancées', value: stages.started },
        { label: 'Commandes payées', value: stages.paid },
        { label: 'Serveurs créés', value: stages.provisioned },
    ];

    return steps.map((step, i) => ({
        label: step.label,
        value: step.value,
        sub: i === 0 || steps[i - 1].value === 0 ? undefined : `${formatPercent((step.value / steps[i - 1].value) * 100, 0)} de l'étape précédente`,
    }));
};

const FunnelTab = ({ range }: { range: BusinessRange }) => {
    const { data, loading } = useAnalytics<FunnelAnalytics>(() => getFunnelAnalytics(range), [ range ]);

    if (!data) {
        return <Loader/>;
    }

    const s = data.stages;
    const conversion = s.visitors > 0 ? (s.paid / s.visitors) * 100 : null;
    const insights: { tone: Tone; text: React.ReactNode }[] = [];

    if (data.abandoned.checkouts > 0) {
        insights.push({
            tone: 'warning',
            text: <><strong>{data.abandoned.checkouts}</strong> {plural(data.abandoned.checkouts, 'paiement n’a pas été finalisé', 'paiements n’ont pas été finalisés')}, soit <strong>{formatMoney(data.abandoned.value)}</strong> de revenu mensuel potentiel. Une relance par email ou un moyen de paiement supplémentaire peut en récupérer une partie.</>,
        });
    }

    const rated = data.byGame.filter(game => game.visitors >= 30 && game.conversion !== null);
    if (rated.length > 1) {
        const best = rated.reduce((a, b) => (a.conversion! >= b.conversion! ? a : b));
        const worst = rated.reduce((a, b) => (a.conversion! <= b.conversion! ? a : b));

        if (best.name !== worst.name) {
            insights.push({
                tone: 'info',
                text: <><strong>{best.name}</strong> convertit le mieux ({formatPercent(best.conversion)}) et <strong>{worst.name}</strong> le moins bien ({formatPercent(worst.conversion)}) : le trafic vers {worst.name} est le plus à optimiser.</>,
            });
        }
    }

    const leaky = data.byProduct.find(product => product.started >= 5 && product.abandoned / product.started >= 0.5);
    if (leaky) {
        insights.push({
            tone: 'warning',
            text: <>Plus d&apos;une commande sur deux de l&apos;offre <strong>{leaky.name}</strong> n&apos;est pas payée : vérifiez son prix et sa description.</>,
        });
    }

    if (conversion !== null && s.visitors >= 50) {
        insights.push({
            tone: conversion < 1 ? 'warning' : 'good',
            text: <><strong>{formatPercent(conversion, 2)}</strong> des visiteurs deviennent clients{conversion < 1 ? '. Un site d’hébergement bien réglé se situe plutôt entre 1 et 3 %.' : '.'}</>,
        });
    }

    const referrers = [
        { label: 'Accès direct', value: data.sources.direct },
        ...data.sources.referrers.map(r => ({ label: r.host, value: r.visitors })),
    ].filter(row => row.value > 0);

    const rangeLabel = ranges.find(option => option.value === range)!.label.toLowerCase();

    return (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
            {s.visitors === 0 && (
                <div css={[ card, tw`mb-6 px-5 py-4 text-sm leading-relaxed text-neutral-300` ]} style={{ borderLeft: `3px solid ${palette.series[0]}` }}>
                    {data.tracking
                        ? 'Aucune visite sur cette période. Le suivi est actif : les visiteurs apparaîtront ici dès qu’ils parcourent la vitrine.'
                        : 'Le suivi des visites vient d’être activé : les visiteurs apparaîtront ici dès leur prochain passage. Les commandes ci-dessous sont déjà comptées.'}
                </div>
            )}

            <Insights items={insights}/>

            <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
                <Stat label={'Visiteurs'} value={formatCount(s.visitors)} hint={'Visiteurs uniques par jour, sans cookie'}>
                    <div css={tw`mb-1`}><Trend delta={computeDelta(s.visitors, data.stagesPrevious.visitors)}/></div>
                </Stat>
                <Stat label={'Commandes payées'} value={formatCount(s.paid)} hint={`${formatCount(s.started)} commandes lancées`}>
                    <div css={tw`mb-1`}><Trend delta={computeDelta(s.paid, data.stagesPrevious.paid)}/></div>
                </Stat>
                <Stat label={'Visiteurs devenus clients'} value={formatPercent(conversion, 2)} hint={'Commandes payées divisées par les visiteurs'}/>
                <Stat label={'Paiements non finalisés'} value={formatCount(data.abandoned.checkouts)} hint={`${formatMoney(data.abandoned.value)} de revenu mensuel potentiel`}/>
            </div>

            <div css={tw`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3`}>
                <ChartCard css={tw`lg:col-span-2`} title={'Parcours des visiteurs'} subtitle={`Où l’on perd du monde · ${rangeLabel}`}>
                    <BarList rows={stageRows(s)} formatValue={formatCount}/>
                </ChartCard>

                <ChartCard title={'D’où viennent les visiteurs'} subtitle={'Origine de la première page vue'}>
                    {referrers.length === 0 ? (
                        <p css={tw`py-10 text-center text-sm text-neutral-500`}>Aucune visite enregistrée.</p>
                    ) : (
                        <BarList color={palette.series[1]} rows={referrers} formatValue={formatCount}/>
                    )}
                </ChartCard>

                <ChartCard css={tw`lg:col-span-2`} title={'Visiteurs par jour'} subtitle={`Visiteurs uniques · ${rangeLabel}`}>
                    <LineChart area data={data.series} series={[ { key: 'visitors', name: 'Visiteurs', color: palette.series[0] } ]} formatValue={formatCount}/>
                </ChartCard>

                <ChartCard
                    title={'Commandes par jour'}
                    subtitle={'Lancées et payées'}
                    legend={[
                        { key: 'started', name: 'Lancées', color: palette.series[1] },
                        { key: 'paid', name: 'Payées', color: palette.series[0] },
                    ]}
                >
                    <LineChart
                        data={data.series}
                        series={[
                            { key: 'started', name: 'Lancées', color: palette.series[1] },
                            { key: 'paid', name: 'Payées', color: palette.series[0] },
                        ]}
                        formatValue={formatCount}
                    />
                </ChartCard>

                <ChartCard
                    css={tw`lg:col-span-3`}
                    title={'Assistants IA'}
                    subtitle={`Les assistants lisent-ils le site, et renvoient-ils des visiteurs ? · ${rangeLabel}`}
                >
                    <div css={tw`grid grid-cols-1 gap-8 lg:grid-cols-3`}>
                        <div css={tw`lg:col-span-2`}>
                            <DataTable
                                columns={[ 'Robot', 'Opérateur', 'Usage', 'Passages', 'Pages lues', 'Dernier passage' ]}
                                empty={'Aucun passage de robot IA sur cette période. Ils repassent rarement le jour même : comptez plusieurs jours après la mise en ligne.'}
                                rows={data.ai.crawlers.map(crawler => [
                                    <span key={crawler.bot} css={tw`text-left`}>{crawler.bot}</span>,
                                    crawler.operator,
                                    aiPurposes[crawler.purpose] || crawler.purpose,
                                    formatCount(crawler.hits),
                                    formatCount(crawler.pages),
                                    new Date(crawler.lastSeen).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                                ])}
                            />
                            {data.ai.topPages.length > 0 && (
                                <p css={tw`mt-4 text-xs text-neutral-400`}>
                                    Pages les plus lues : {data.ai.topPages.map(page => `${page.path} (${page.hits})`).join(', ')}
                                </p>
                            )}
                        </div>
                        <div>
                            <p css={tw`text-xs font-semibold uppercase tracking-wider text-neutral-400`}>Visiteurs venus d’un assistant</p>
                            <p css={tw`mt-2 font-header text-3xl font-extrabold text-neutral-50`} style={numeric}>{formatCount(data.ai.referralVisitors)}</p>
                            {data.ai.referrals.length === 0 ? (
                                <p css={tw`mt-2 text-xs leading-snug text-neutral-400`}>
                                    Aucun pour l’instant. Un assistant ne transmet pas toujours son origine : ce chiffre est un minimum.
                                </p>
                            ) : (
                                <ul css={tw`mt-3 space-y-1.5 text-sm`}>
                                    {data.ai.referrals.map(referral => (
                                        <li key={referral.name} css={tw`flex justify-between gap-3 text-neutral-200`}>
                                            <span>{referral.name}</span>
                                            <span css={tw`font-semibold`} style={numeric}>{formatCount(referral.visitors)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </ChartCard>

                <ChartCard css={tw`lg:col-span-3`} title={'Conversion par jeu'} subtitle={'Visiteurs de la page du jeu jusqu’au paiement'}>
                    <DataTable
                        columns={[ 'Jeu', 'Visiteurs', 'Page commande', 'Lancées', 'Payées', 'Conversion', 'Revenu vendu' ]}
                        empty={'Aucune donnée sur cette période.'}
                        rows={data.byGame.map(game => [
                            <span key={game.name} css={tw`text-left`}>{game.name}</span>,
                            formatCount(game.visitors),
                            formatCount(game.checkout),
                            formatCount(game.started),
                            formatCount(game.paid),
                            formatPercent(game.conversion),
                            formatMoney(game.sold),
                        ])}
                    />
                </ChartCard>

                <ChartCard css={tw`lg:col-span-3`} title={'Conversion par offre'} subtitle={'Ce qui se passe une fois la commande ouverte'}>
                    <DataTable
                        columns={[ 'Offre', 'Page commande', 'Lancées', 'Payées', 'Abandonnées', 'Revenu perdu', 'Conversion' ]}
                        empty={'Aucune donnée sur cette période.'}
                        rows={data.byProduct.map(product => [
                            <span key={product.name + (product.game || '')} css={tw`text-left`}>
                                {product.name}{product.game && <span css={tw`ml-2 text-xs text-neutral-500`}>{product.game}</span>}
                            </span>,
                            formatCount(product.checkout),
                            formatCount(product.started),
                            formatCount(product.paid),
                            formatCount(product.abandoned),
                            formatMoney(product.abandonedValue),
                            formatPercent(product.conversion),
                        ])}
                    />
                </ChartCard>
            </div>

            <p css={tw`mt-6 text-xs text-neutral-500`}>
                Les visites sont comptées sans cookie ni adresse IP conservée : un visiteur qui revient un autre jour compte à nouveau. Les administrateurs et les navigateurs avec « Ne pas suivre » ne sont pas comptés.
            </p>
        </div>
    );
};

const daysLabel = (days: number): string => (days >= 365 ? 'plus d’un an' : `${days} ${plural(days, 'jour', 'jours')}`);

const CapacityTab = () => {
    const { data, loading } = useAnalytics<CapacityAnalytics>(() => getCapacityAnalytics(), []);

    if (!data) {
        return <Loader/>;
    }

    const soonest = (node: CapacityAnalytics['nodes'][number]): number => Math.min(node.memoryDaysLeft ?? Infinity, node.diskDaysLeft ?? Infinity);
    const nodes = [ ...data.nodes ].sort((a, b) => soonest(a) - soonest(b));
    const urgent = nodes.filter(node => soonest(node) <= 30);
    const totalMrr = nodes.reduce((sum, node) => sum + node.mrr, 0);

    return (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
            <Insights
                items={urgent.map(node => ({
                    tone: soonest(node) <= 14 ? 'critical' as Tone : 'warning' as Tone,
                    text: <><strong>{node.name}</strong> sera plein dans environ <strong>{daysLabel(soonest(node))}</strong> au rythme des 30 derniers jours. Prévoyez un node supplémentaire ou de l&apos;espace avant de continuer à vendre.</>,
                }))}
            />

            {nodes.length === 0 ? (
                <p css={tw`py-10 text-center text-sm text-neutral-500`}>Aucun node configuré.</p>
            ) : (
                <>
                    <div css={tw`grid grid-cols-1 gap-4 md:grid-cols-2`}>
                        {nodes.map(node => {
                            const days = soonest(node);

                            return (
                                <div key={node.id} css={[ card, tw`p-5` ]}>
                                    <div css={tw`flex items-start justify-between gap-3`}>
                                        <div>
                                            <Link to={`/admin/nodes/${node.id}`} css={tw`text-sm font-semibold text-neutral-100 hover:text-primary-300`}>{node.name}</Link>
                                            <p css={tw`mt-0.5 text-xs text-neutral-400`}>{node.servers} {plural(node.servers, 'serveur', 'serveurs')}</p>
                                        </div>
                                        <span
                                            css={tw`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold`}
                                            style={{
                                                background: days <= 14 ? 'rgba(208, 59, 59, 0.2)' : days <= 30 ? 'rgba(250, 178, 25, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                                color: days <= 14 ? '#fca5a5' : days <= 30 ? '#fcd34d' : '#d1d5db',
                                            }}
                                        >
                                            {days === Infinity ? 'Stable sur 30 jours' : `Plein dans ${daysLabel(days)}`}
                                        </span>
                                    </div>

                                    <div css={tw`mt-4 space-y-3`}>
                                        <Meter label={'Mémoire'} used={node.memory.used} limit={node.memory.limit} format={formatSize}/>
                                        <Meter label={'Disque'} used={node.disk.used} limit={node.disk.limit} format={formatSize}/>
                                    </div>

                                    <dl css={tw`mt-4 flex justify-between border-t border-white border-opacity-5 pt-3 text-xs`}>
                                        <div>
                                            <dt css={tw`text-neutral-400`}>Revenu hébergé</dt>
                                            <dd css={tw`mt-0.5 text-sm font-semibold text-neutral-50`} style={numeric}>{formatMoney(node.mrr)}</dd>
                                        </div>
                                        <div css={tw`text-right`}>
                                            <dt css={tw`text-neutral-400`}>Par Go de RAM alloué</dt>
                                            <dd css={tw`mt-0.5 text-sm font-semibold text-neutral-50`} style={numeric}>{node.mrrPerGb === null ? '—' : formatMoney(node.mrrPerGb)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            );
                        })}
                    </div>

                    <p css={tw`mt-6 text-xs text-neutral-500`}>
                        Revenu mensuel des services actifs hébergés : {formatMoney(totalMrr)}. La projection reprend le rythme d&apos;allocation des 30 derniers jours.
                    </p>
                </>
            )}
        </div>
    );
};

export default () => {
    const [ tab, setTab ] = useState<Tab>('revenue');
    const [ range, setRange ] = useState<BusinessRange>(30);

    return (
        <AdminContentBlock title={'Analytics'}>
            <div css={tw`mb-6 flex flex-wrap items-end justify-between gap-4`}>
                <div>
                    <h2 css={tw`font-header text-2xl font-extrabold tracking-tight text-neutral-50`}>Analytics</h2>
                    <p css={tw`mt-1 text-base text-neutral-400`}>Ce qui fait grandir ou freine votre activité.</p>
                </div>

                {tab !== 'capacity' && (
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
                )}
            </div>

            <div css={tw`mb-6 flex gap-1 overflow-x-auto border-b border-white border-opacity-10`} role={'tablist'}>
                {tabs.map(item => (
                    <button
                        key={item.value}
                        type={'button'}
                        role={'tab'}
                        aria-selected={tab === item.value}
                        title={item.hint}
                        onClick={() => setTab(item.value)}
                        css={[
                            tw`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-150`,
                            tab === item.value
                                ? tw`border-primary-500 text-neutral-50`
                                : tw`border-transparent text-neutral-400 hover:text-neutral-100`,
                        ]}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <FlashMessageRender byKey={'analytics'} css={tw`mb-4`}/>

            {tab === 'revenue' && <RevenueTab range={range}/>}
            {tab === 'customers' && <CustomersTab range={range}/>}
            {tab === 'funnel' && <FunnelTab range={range}/>}
            {tab === 'capacity' && <CapacityTab/>}
        </AdminContentBlock>
    );
};
