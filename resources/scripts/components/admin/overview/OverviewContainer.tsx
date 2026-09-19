import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faExclamationTriangle, faLifeRing, faReceipt, faServer, faShoppingBag, faUsers } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import getVersion, { VersionData } from '@/api/admin/getVersion';
import getOverview, { Overview } from '@/api/admin/getOverview';

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
    cancelled: { label: 'Annulée', tone: 'neutral' },
};

const Panel = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <div css={tw`overflow-hidden rounded-xl border border-white border-opacity-5 bg-neutral-800`}>
        <div css={tw`flex items-center justify-between border-b border-white border-opacity-5 px-5 py-4`}>
            <h3 css={tw`font-header text-sm font-bold text-neutral-100`}>{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

const Stat = ({ icon, label, value, tone = 'blue', to }: { icon: IconDefinition; label: string; value: number; tone?: 'blue' | 'yellow' | 'red'; to?: string }) => {
    const content = (
        <div css={tw`flex items-center gap-4 rounded-xl border border-white border-opacity-5 bg-neutral-800 p-5`}>
            <div
                css={[
                    tw`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg`,
                    tone === 'blue' && tw`bg-blue-500 bg-opacity-20 text-blue-400`,
                    tone === 'yellow' && tw`bg-yellow-500 bg-opacity-20 text-yellow-400`,
                    tone === 'red' && tw`bg-red-500 bg-opacity-20 text-red-400`,
                ]}
            >
                <FontAwesomeIcon icon={icon}/>
            </div>
            <div>
                <p css={tw`font-header text-2xl font-extrabold leading-none text-neutral-50`}>{value}</p>
                <p css={tw`mt-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400`}>{label}</p>
            </div>
        </div>
    );

    return to ? <Link to={to} css={tw`block hover:opacity-90`}>{content}</Link> : content;
};

const Empty = ({ children }: { children: React.ReactNode }) => (
    <p css={tw`px-5 py-8 text-center text-sm text-neutral-500`}>{children}</p>
);

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ overview, setOverview ] = useState<Overview | undefined>();
    const [ version, setVersion ] = useState<VersionData | undefined>();

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

    return (
        <AdminContentBlock title={'Vue d\'ensemble'}>
            <div css={tw`mb-8`}>
                <h2 css={tw`font-header text-2xl font-extrabold tracking-tight text-neutral-50`}>Vue d&apos;ensemble</h2>
                <p css={tw`mt-1 text-base text-neutral-400`}>L&apos;activité de votre hébergement en un coup d&apos;œil.</p>
            </div>

            <FlashMessageRender byKey={'overview'} css={tw`mb-4`}/>

            {!overview ? (
                <div css={tw`flex w-full items-center justify-center`} style={{ height: '16rem' }}>
                    <Spinner size={'base'}/>
                </div>
            ) : (
                <>
                    {overview.counts.ordersFailed > 0 && (
                        <div css={tw`mb-6 flex items-center gap-3 rounded-xl border border-red-500 border-opacity-30 bg-red-500 bg-opacity-10 px-5 py-4 text-sm text-red-200`}>
                            <FontAwesomeIcon icon={faExclamationTriangle}/>
                            <span>
                                {overview.counts.ordersFailed} commande(s) payée(s) n&apos;ont pas pu créer leur serveur automatiquement — une intervention manuelle est nécessaire.
                            </span>
                        </div>
                    )}

                    <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
                        <Stat icon={faUsers} label={'Clients'} value={overview.counts.customers} to={'/admin/users'}/>
                        <Stat icon={faServer} label={'Serveurs'} value={overview.counts.servers} to={'/admin/servers'}/>
                        <Stat icon={faShoppingBag} label={'Offres actives'} value={overview.counts.products} to={'/admin/products'}/>
                        <Stat icon={faReceipt} label={'Commandes'} value={overview.counts.orders}/>
                        <Stat icon={faServer} label={'Nodes'} value={overview.counts.nodes} to={'/admin/nodes'}/>
                        <Stat icon={faReceipt} label={'Serveurs livrés'} value={overview.counts.ordersActive}/>
                        <Stat
                            icon={faLifeRing}
                            label={'Tickets à traiter'}
                            value={overview.counts.ticketsWaiting}
                            tone={overview.counts.ticketsWaiting > 0 ? 'yellow' : 'blue'}
                            to={'/admin/tickets'}
                        />
                        <Stat
                            icon={faExclamationTriangle}
                            label={'Créations en échec'}
                            value={overview.counts.ordersFailed}
                            tone={overview.counts.ordersFailed > 0 ? 'red' : 'blue'}
                        />
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
                </>
            )}
        </AdminContentBlock>
    );
};
