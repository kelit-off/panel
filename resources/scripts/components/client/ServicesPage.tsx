import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faServer, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { getServers } from '@/api/account';
import { PaginatedResult } from '@/api/http';
import { Server } from '@definitions/user';
import { Btn, Card, EmptyState, LinkButton, PageTitle, Pill } from '@/components/client/ui';
import { serverStatus } from '@/components/client/serverStatus';
import { formatCpu } from '@/helpers';

const formatSize = (mb: number): string => {
    if (mb === 0) return 'Illimité';

    return mb >= 1024 ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} Go` : `${mb} Mo`;
};

const Spec = ({ label, value }: { label: string; value: string }) => (
    <div css={tw`rounded-lg bg-neutral-50 px-3 py-2`}>
        <p css={tw`text-[10px] font-bold uppercase tracking-wider text-neutral-400`}>{label}</p>
        <p css={tw`mt-0.5 text-sm font-semibold text-neutral-900`}>{value}</p>
    </div>
);

export default () => {
    const [ page, setPage ] = useState(1);
    const { data: servers, error } = useSWR<PaginatedResult<Server>>([ '/api/client/servers', 'services', page ], () => getServers({ page }));

    return (
        <>
            <PageTitle
                title={'Mes services'}
                subtitle={'Tous vos serveurs, avec leurs ressources et leur état.'}
                action={<LinkButton to={'/'} variant={'secondary'}>Commander un service</LinkButton>}
            />

            {error ? (
                <Card><p css={tw`text-sm text-red-600`}>Impossible de charger vos services pour le moment.</p></Card>
            ) : !servers ? (
                <Card><p css={tw`text-sm text-neutral-400`}>Chargement…</p></Card>
            ) : servers.items.length === 0 ? (
                <Card padded={false}>
                    <EmptyState
                        icon={faServer}
                        title={'Aucun service pour le moment'}
                        text={'Commandez votre premier serveur, il sera créé automatiquement après le paiement.'}
                        action={<LinkButton to={'/'}>Voir les offres</LinkButton>}
                    />
                </Card>
            ) : (
                <>
                    <div css={tw`grid grid-cols-1 gap-4 lg:grid-cols-2`}>
                        {servers.items.map(server => {
                            const status = serverStatus(server);

                            return (
                                <Card key={server.uuid}>
                                    <div css={tw`flex items-start justify-between gap-3`}>
                                        <div css={tw`flex min-w-0 items-center gap-3`}>
                                            <div css={tw`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600`}>
                                                <FontAwesomeIcon icon={faServer}/>
                                            </div>
                                            <div css={tw`min-w-0`}>
                                                <p css={tw`truncate font-vitrine-display text-base font-bold text-neutral-900`}>{server.name}</p>
                                                <p css={tw`truncate text-xs text-neutral-500`}>{server.node}</p>
                                            </div>
                                        </div>
                                        <Pill tone={status.tone}>{status.label}</Pill>
                                    </div>

                                    <div css={tw`mt-5 grid grid-cols-3 gap-2`}>
                                        <Spec label={'Mémoire'} value={formatSize(server.limits.memory)}/>
                                        <Spec label={'Disque'} value={formatSize(server.limits.disk)}/>
                                        <Spec label={'CPU'} value={server.limits.cpu === 0 ? 'Illimité' : formatCpu(server.limits.cpu)}/>
                                    </div>

                                    <div css={tw`mt-5`}>
                                        <Link
                                            to={`/server/${server.id}`}
                                            css={tw`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 text-sm font-bold text-white shadow-sm transition-colors duration-150 hover:bg-primary-700`}
                                        >
                                            <FontAwesomeIcon icon={faTerminal}/> Ouvrir la console
                                        </Link>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {servers.pagination.totalPages > 1 && (
                        <div css={tw`mt-6 flex items-center justify-center gap-3`}>
                            <Btn variant={'secondary'} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                <FontAwesomeIcon icon={faChevronLeft}/>
                            </Btn>
                            <span css={tw`text-sm text-neutral-500`}>Page {servers.pagination.currentPage} / {servers.pagination.totalPages}</span>
                            <Btn variant={'secondary'} disabled={page >= servers.pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </Btn>
                        </div>
                    )}
                </>
            )}
        </>
    );
};
