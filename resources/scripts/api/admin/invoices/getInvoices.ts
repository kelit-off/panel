import http from '@/api/http';

export interface Invoice {
    id: string;
    number: string | null;
    date: Date;
    total: string;
    status: string;
    customer: { id: number; username: string; email: string } | null;
    hostedUrl: string | null;
    pdfUrl: string | null;
}

export interface InvoicesPage {
    items: Invoice[];
    hasMore: boolean;
    nextCursor: string | null;
}

export default (startingAfter?: string | null): Promise<InvoicesPage> => {
    return new Promise((resolve, reject) => {
        http.get('/api/application/invoices', {
            params: startingAfter ? { starting_after: startingAfter } : {},
        })
            .then(({ data }) => resolve({
                items: (data.data as any[]).map(datum => ({
                    id: datum.id,
                    number: datum.number,
                    date: new Date(datum.date),
                    total: datum.total,
                    status: datum.status,
                    customer: datum.customer,
                    hostedUrl: datum.hosted_url,
                    pdfUrl: datum.pdf_url,
                })),
                hasMore: data.meta.has_more,
                nextCursor: data.meta.next_cursor,
            }))
            .catch(reject);
    });
};
