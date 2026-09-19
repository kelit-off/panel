import http from '@/api/http';
import { TicketReply, rawDataToReply } from '@/api/admin/tickets/getTickets';

export default (id: number, message: string): Promise<TicketReply> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/tickets/${id}/replies`, { message })
            .then(({ data }) => resolve(rawDataToReply(data.data)))
            .catch(reject);
    });
};
