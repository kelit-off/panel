import http from '@/api/http';
import { Ticket, rawDataToTicket } from '@/api/admin/tickets/getTickets';

export default (id: number, data: { status?: string; priority?: string }): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/tickets/${id}`, data)
            .then(({ data }) => resolve(rawDataToTicket(data.data)))
            .catch(reject);
    });
};
