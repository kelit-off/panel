import http, { getPaginationSet, PaginatedResult } from '@/api/http';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api/admin';

export interface TicketReply {
    id: number;
    message: string;
    isStaff: boolean;
    author: string | null;
    createdAt: Date;
}

export interface Ticket {
    id: number;
    subject: string;
    priority: string;
    status: string;
    customer: { id: number; username: string; email: string } | null;
    createdAt: Date;
    updatedAt: Date;
    replies: TicketReply[] | null;
}

export const rawDataToReply = (datum: any): TicketReply => ({
    id: datum.id,
    message: datum.message,
    isStaff: datum.is_staff,
    author: datum.author,
    createdAt: new Date(datum.created_at),
});

export const rawDataToTicket = (datum: any): Ticket => ({
    id: datum.id,
    subject: datum.subject,
    priority: datum.priority,
    status: datum.status,
    customer: datum.customer,
    createdAt: new Date(datum.created_at),
    updatedAt: new Date(datum.updated_at),
    replies: (datum.replies || null) && datum.replies.map(rawDataToReply),
});

export interface Filters {
    id?: string;
    subject?: string;
    status?: string;
}

export const Context = createContext<Filters>();

export default () => {
    const { page, filters, sort, sortDirection } = useContext(Context);

    const params: Record<string, unknown> = {};
    if (filters !== null) {
        Object.keys(filters).forEach(key => {
            // @ts-ignore
            params['filter[' + key + ']'] = filters[key];
        });
    }

    if (sort !== null) {
        params.sort = (sortDirection ? '-' : '') + sort;
    }

    return useSWR<PaginatedResult<Ticket>>([ 'tickets', page, filters, sort, sortDirection ], async () => {
        const { data } = await http.get('/api/application/tickets', { params: { page, ...params } });

        return ({
            items: (data.data || []).map(rawDataToTicket),
            pagination: getPaginationSet({
                total: data.meta.total,
                count: (data.data || []).length,
                per_page: 25,
                current_page: data.meta.current_page,
                total_pages: data.meta.last_page,
            }),
        });
    });
};
