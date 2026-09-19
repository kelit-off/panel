import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import http from '@/api/http';
import { AxiosError } from 'axios';
import useUserSWRContextKey from '@/plugins/useUserSWRContextKey';

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
    createdAt: Date;
    updatedAt: Date;
    replies: TicketReply[] | null;
}

const rawDataToReply = (datum: any): TicketReply => ({
    id: datum.id,
    message: datum.message,
    isStaff: datum.is_staff,
    author: datum.author,
    createdAt: new Date(datum.created_at),
});

const rawDataToTicket = (datum: any): Ticket => ({
    id: datum.id,
    subject: datum.subject,
    priority: datum.priority,
    status: datum.status,
    createdAt: new Date(datum.created_at),
    updatedAt: new Date(datum.updated_at),
    replies: (datum.replies || null) && datum.replies.map(rawDataToReply),
});

const useTickets = (
    config?: SWRConfiguration<Ticket[], AxiosError>,
): SWRResponse<Ticket[], AxiosError> => {
    const key = useUserSWRContextKey([ 'account', 'tickets' ]);

    return useSWR(key, async () => {
        const { data } = await http.get('/api/client/tickets');

        return (data.data as any[]).map(rawDataToTicket);
    }, config || { revalidateOnMount: true });
};

const useTicket = (
    id: number,
    config?: SWRConfiguration<Ticket, AxiosError>,
): SWRResponse<Ticket, AxiosError> => {
    return useSWR(`ticket:${id}`, async () => {
        const { data } = await http.get(`/api/client/tickets/${id}`);

        return rawDataToTicket(data.data);
    }, config || { revalidateOnMount: true });
};

const createTicket = async (subject: string, message: string, priority = 'medium'): Promise<Ticket> => {
    const { data } = await http.post('/api/client/tickets', { subject, message, priority });

    return rawDataToTicket(data.data);
};

const replyToTicket = async (id: number, message: string): Promise<TicketReply> => {
    const { data } = await http.post(`/api/client/tickets/${id}/replies`, { message });

    return rawDataToReply(data.data);
};

const closeTicket = async (id: number): Promise<Ticket> => {
    const { data } = await http.post(`/api/client/tickets/${id}/close`);

    return rawDataToTicket(data.data);
};

export { useTickets, useTicket, createTicket, replyToTicket, closeTicket };
