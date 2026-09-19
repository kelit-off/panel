import React from 'react';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faLifeRing } from '@fortawesome/free-solid-svg-icons';
import { useTickets } from '@/api/account/tickets';
import { Card, EmptyState, LinkButton, PageTitle, Pill, formatDateTime } from '@/components/client/ui';
import { ticketStatus } from '@/components/client/ticketStatus';

export default () => {
    const { data: tickets, error } = useTickets();

    return (
        <>
            <PageTitle
                title={'Support'}
                subtitle={'Une question, un problème ? Ouvrez un ticket, nous vous répondons ici.'}
                action={<LinkButton to={'/account/tickets/new'}>Nouveau ticket</LinkButton>}
            />

            <Card padded={false}>
                {error ? (
                    <p css={tw`p-6 text-sm text-red-600`}>Impossible de charger vos tickets pour le moment.</p>
                ) : !tickets ? (
                    <p css={tw`p-6 text-sm text-neutral-400`}>Chargement…</p>
                ) : tickets.length === 0 ? (
                    <EmptyState
                        icon={faLifeRing}
                        title={'Aucun ticket'}
                        text={'Vous n\'avez pas encore contacté le support.'}
                        action={<LinkButton to={'/account/tickets/new'}>Ouvrir un ticket</LinkButton>}
                    />
                ) : (
                    <ul>
                        {tickets.map(ticket => {
                            const status = ticketStatus(ticket.status);

                            return (
                                <li key={ticket.id} css={tw`border-b border-neutral-100 last:border-0`}>
                                    <Link to={`/account/tickets/${ticket.id}`} css={tw`flex items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-neutral-50`}>
                                        <div css={tw`min-w-0 flex-1`}>
                                            <p css={tw`truncate text-sm font-bold text-neutral-900`}>{ticket.subject}</p>
                                            <p css={tw`text-xs text-neutral-500`}>#{ticket.id} &middot; Mis à jour le {formatDateTime(ticket.updatedAt)}</p>
                                        </div>
                                        <Pill tone={status.tone}>{status.label}</Pill>
                                        <FontAwesomeIcon icon={faChevronRight} css={tw`text-xs text-neutral-300`}/>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </>
    );
};
