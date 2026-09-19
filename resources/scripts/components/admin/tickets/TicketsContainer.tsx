import React, { useContext, useEffect } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import getTickets, { Context as TicketsContext, Filters } from '@/api/admin/tickets/getTickets';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import AdminTable, { TableBody, TableHead, TableHeader, TableRow, Pagination, Loading, NoItems, useTableHooks } from '@/components/admin/AdminTable';

const statusLabel: Record<string, string> = {
    open: 'Ouvert',
    answered: 'Répondu',
    'customer-reply': 'Client a répondu',
    closed: 'Fermé',
};

const priorityLabel: Record<string, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
};

const Badge = ({ status }: { status: string }) => (
    <span
        css={[
            tw`inline-block rounded-full px-2 py-px text-xs font-medium text-white`,
            status === 'answered' && tw`bg-green-600`,
            status === 'customer-reply' && tw`bg-red-600`,
            status === 'open' && tw`bg-yellow-600`,
            status === 'closed' && tw`bg-neutral-600`,
        ]}
    >
        {statusLabel[status] || status}
    </span>
);

const TicketsContainer = () => {
    const match = useRouteMatch();

    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(TicketsContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: tickets, error, isValidating } = getTickets();

    useEffect(() => {
        if (!error) {
            clearFlashes('tickets');
            return;
        }

        clearAndAddHttpError({ key: 'tickets', error });
    }, [ error ]);

    const length = tickets?.items?.length || 0;

    const onSearch = (query: string): Promise<void> => {
        return new Promise((resolve) => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ subject: query });
            }
            return resolve();
        });
    };

    return (
        <AdminContentBlock title={'Tickets'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>Tickets de support</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>Les demandes ouvertes par les clients.</p>
                </div>
            </div>

            <FlashMessageRender byKey={'tickets'} css={tw`mb-4`}/>

            <AdminTable>
                <div css={tw`mb-4 px-6`}>
                    <input
                        type={'text'}
                        placeholder={'Rechercher un sujet...'}
                        onChange={e => onSearch(e.currentTarget.value)}
                        css={tw`h-10 w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-100 outline-none focus:border-primary-400`}
                    />
                </div>
                <Pagination data={tickets} onPageSelect={setPage}>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader name={'ID'} direction={sort === 'id' ? (sortDirection ? 1 : 2) : null} onClick={() => setSort('id')}/>
                                <TableHeader name={'Sujet'}/>
                                <TableHeader name={'Client'}/>
                                <TableHeader name={'Priorité'}/>
                                <TableHeader name={'Statut'}/>
                                <TableHeader name={'Mis à jour'} direction={sort === 'updated_at' ? (sortDirection ? 1 : 2) : null} onClick={() => setSort('updated_at')}/>
                            </TableHead>

                            <TableBody>
                                { tickets !== undefined && !error && !isValidating && length > 0 &&
                                    tickets.items.map(ticket => (
                                        <TableRow key={ticket.id}>
                                            <td/>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>{ticket.id}</td>

                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <NavLink to={`${match.url}/${ticket.id}`} css={tw`text-primary-400 hover:text-primary-300`}>
                                                    {ticket.subject}
                                                </NavLink>
                                            </td>

                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                {ticket.customer?.email || <span css={tw`italic text-neutral-500`}>Inconnu</span>}
                                            </td>

                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>{priorityLabel[ticket.priority] || ticket.priority}</td>

                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                <Badge status={ticket.status}/>
                                            </td>

                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                {ticket.updatedAt.toLocaleDateString('fr-FR')}
                                            </td>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </table>

                        { tickets === undefined || (error && isValidating) ?
                            <Loading/>
                            :
                            length < 1 ?
                                <NoItems/>
                                :
                                null
                        }
                    </div>
                </Pagination>
            </AdminTable>
        </AdminContentBlock>
    );
};

export default () => {
    const hooks = useTableHooks<Filters>();

    return (
        <TicketsContext.Provider value={hooks}>
            <TicketsContainer/>
        </TicketsContext.Provider>
    );
};
