import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import http from '@/api/http';
import { AxiosError } from 'axios';
import useUserSWRContextKey from '@/plugins/useUserSWRContextKey';

export interface Invoice {
    id: string;
    number: string | null;
    date: Date;
    total: string;
    status: string;
    hostedUrl: string | null;
    pdfUrl: string | null;
}

const useInvoices = (
    config?: SWRConfiguration<Invoice[], AxiosError>,
): SWRResponse<Invoice[], AxiosError> => {
    const key = useUserSWRContextKey([ 'account', 'invoices' ]);

    return useSWR(key, async () => {
        const { data } = await http.get('/api/client/account/billing/invoices');

        return (data.data as any[]).map(datum => ({
            id: datum.id,
            number: datum.number,
            date: new Date(datum.date),
            total: datum.total,
            status: datum.status,
            hostedUrl: datum.hosted_url,
            pdfUrl: datum.pdf_url,
        }));
    }, config || { revalidateOnMount: true });
};

export { useInvoices };
