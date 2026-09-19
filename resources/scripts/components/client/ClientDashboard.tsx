import React from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faLifeRing, faServer, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { getServers } from '@/api/account';
import { PaginatedResult } from '@/api/http';
import { Server } from '@definitions/user';
import { useTickets } from '@/api/account/tickets';
import { Card, CardTitle, EmptyState, LinkButton, PageTitle, Pill, formatDate } from '@/components/client/ui';
import { serverStatus } from '@/components/client/serverStatus';
import { ticketStatus } from '@/components/client/ticketStatus';

const Stat = ({ icon, label, value, to }: { icon: IconDefinition; label: string; value: React.ReactNode; to: string }) => (
    <Link to={to} css={tw`block rounded-2xl transition-shadow duration-150 hover:shadow-md`}>
        <Card>
            <div css={tw`flex items-center gap-4`}>
                <div css={tw`flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600`}>
                    <FontAwesomeIcon icon={icon}/>
                </div>
                <div>
                    <p css={tw`font-vitrine-display text-2xl font-bold leading-none text-neutral-900`}>{value}</p>
                    <p css={tw`mt-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400`}>{label}</p>
                </div>
            </div>
        </Card>
    </Link>
);

export default () => {
    const username = useStoreState((state: ApplicationStore) => state.user.data!.username);
    const { data: servers } = useSWR<PaginatedResult<Server>>([ '/api/client/servers', 'dashboard' ], () => getServers({ page: 1 }));
    const { data: tickets } = useTickets();

    const openTickets = (tickets || []).filter(ticket => ticket.status !== 'closed');

    return (
        <>
            <PageTitle
                title={`Bonjour, ${username}`}
                subtitle={'Retrouvez vos services, vos factures et vos demandes de support au même endroit.'}
                action={<LinkButton to={'/'}><FontAwesomeIcon icon={faShoppingCart}/> Commander un service</LinkButton>}
            />

            <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-3`}>
                <Stat icon={faServer} label={'Services'} value={servers ? servers.pagination.total : '–'} to={'/account/services'}/>
                <Stat icon={faLifeRing} label={'Tickets ouverts'} value={tickets ? openTickets.length : '–'} to={'/account/tickets'}/>
                <Stat icon={faFileInvoice} label={'Factures'} value={'Voir'} to={'/account/billing'}/>
            </div>

            <div css={tw`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5`}>
                <div css={tw`lg:col-span-3`}>
                    <Card padded={false}>
                        <div css={tw`px-6 pt-6`}>
                            <CardTitle action={<Link to={'/account/services'} css={tw`text-sm font-semibold text-primary-600 hover:text-primary-700`}>Tout voir</Link>}>
                                Mes services
                            </CardTitle>
                        </div>
                        {!servers ? (
                            <p css={tw`px-6 pb-6 text-sm text-neutral-400`}>Chargement…</p>
                        ) : servers.items.length === 0 ? (
                            <EmptyState
                                icon={faServer}
                                title={'Aucun service pour le moment'}
                                text={'Commandez votre premier serveur, il sera créé automatiquement après le paiement.'}
                                action={<LinkButton to={'/'}>Voir les offres</LinkButton>}
                            />
                        ) : (
                            <ul>
                                {servers.items.slice(0, 5).map(server => {
                                    const status = serverStatus(server);

                                    return (
                                        <li key={server.uuid} css={tw`border-t border-neutral-100`}>
                                            <Link to={`/server/${server.id}`} css={tw`flex items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-neutral-50`}>
                                                <div css={tw`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500`}>
                                                    <FontAwesomeIcon icon={faServer}/>
                                                </div>
                                                <div css={tw`min-w-0 flex-1`}>
                                                    <p css={tw`truncate text-sm font-bold text-neutral-900`}>{server.name}</p>
                                                    <p css={tw`truncate text-xs text-neutral-500`}>{server.node}</p>
                                                </div>
                                                <Pill tone={status.tone}>{status.label}</Pill>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                </div>

                <div css={tw`lg:col-span-2`}>
                    <Card padded={false}>
                        <div css={tw`px-6 pt-6`}>
                            <CardTitle action={<Link to={'/account/tickets'} css={tw`text-sm font-semibold text-primary-600 hover:text-primary-700`}>Tout voir</Link>}>
                                Derniers tickets
                            </CardTitle>
                        </div>
                        {!tickets ? (
                            <p css={tw`px-6 pb-6 text-sm text-neutral-400`}>Chargement…</p>
                        ) : tickets.length === 0 ? (
                            <EmptyState
                                icon={faLifeRing}
                                title={'Aucun ticket'}
                                text={'Une question ? Notre équipe vous répond directement ici.'}
                                action={<LinkButton to={'/account/tickets/new'} variant={'secondary'}>Ouvrir un ticket</LinkButton>}
                            />
                        ) : (
                            <ul>
                                {tickets.slice(0, 5).map(ticket => {
                                    const status = ticketStatus(ticket.status);

                                    return (
                                        <li key={ticket.id} css={tw`border-t border-neutral-100`}>
                                            <Link to={`/account/tickets/${ticket.id}`} css={tw`flex items-center gap-3 px-6 py-4 transition-colors duration-150 hover:bg-neutral-50`}>
                                                <div css={tw`min-w-0 flex-1`}>
                                                    <p css={tw`truncate text-sm font-bold text-neutral-900`}>{ticket.subject}</p>
                                                    <p css={tw`text-xs text-neutral-500`}>{formatDate(ticket.updatedAt)}</p>
                                                </div>
                                                <Pill tone={status.tone}>{status.label}</Pill>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
};
