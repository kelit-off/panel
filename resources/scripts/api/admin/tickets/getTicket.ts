import http from '@/api/http';
import { Ticket, rawDataToTicket } from '@/api/admin/tickets/getTickets';

export default (id: number): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/tickets/${id}`)
            .then(({ data }) => resolve(rawDataToTicket(data.data)))
            .catch(reject);
    });
};
