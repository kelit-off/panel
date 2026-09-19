import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import AdminTable, { TableBody, TableHead, TableHeader, TableRow, Loading, NoItems } from '@/components/admin/AdminTable';
import Button from '@/components/elements/Button';
import getInvoices, { Invoice } from '@/api/admin/invoices/getInvoices';
import { httpErrorToHuman } from '@/api/http';

const statusLabel: Record<string, string> = {
    paid: 'Payée',
    open: 'En attente',
    void: 'Annulée',
    uncollectible: 'Impayée',
    draft: 'Brouillon',
};

const Badge = ({ status }: { status: string }) => (
    <span
        css={[
            tw`inline-block rounded-full px-2 py-px text-xs font-medium text-white`,
            status === 'paid' && tw`bg-green-600`,
            status === 'open' && tw`bg-yellow-600`,
            status === 'uncollectible' && tw`bg-red-600`,
            (status === 'void' || status === 'draft') && tw`bg-neutral-600`,
        ]}
    >
        {statusLabel[status] || status}
    </span>
);

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ invoices, setInvoices ] = useState<Invoice[]>([]);
    const [ cursor, setCursor ] = useState<string | null>(null);
    const [ hasMore, setHasMore ] = useState(false);
    const [ loading, setLoading ] = useState(true);
    const [ configError, setConfigError ] = useState('');

    const load = (after?: string | null) => {
        setLoading(true);
        clearFlashes('invoices');
        setConfigError('');

        getInvoices(after)
            .then(page => {
                setInvoices(prev => (after ? [ ...prev, ...page.items ] : page.items));
                setHasMore(page.hasMore);
                setCursor(page.nextCursor);
            })
            .catch(error => {
                console.error(error);
                if (error?.response?.status === 503) {
                    setConfigError(httpErrorToHuman(error));
                } else {
                    clearAndAddHttpError({ key: 'invoices', error });
                }
            })
            .then(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <AdminContentBlock title={'Invoices'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>Factures</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>Les factures les plus récentes, générées par Stripe pour chaque abonnement.</p>
                </div>
            </div>

            <FlashMessageRender byKey={'invoices'} css={tw`mb-4`}/>

            {configError ? (
                <p css={tw`text-center text-sm text-neutral-400`}>{configError}</p>
            ) : (
                <AdminTable>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader name={'Numéro'}/>
                                <TableHeader name={'Client'}/>
                                <TableHeader name={'Date'}/>
                                <TableHeader name={'Montant'}/>
                                <TableHeader name={'Statut'}/>
                                <TableHeader name={''}/>
                            </TableHead>

                            <TableBody>
                                {invoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <td/>
                                        <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                            {invoice.number || invoice.id}
                                        </td>
                                        <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                            {invoice.customer ? invoice.customer.email : (
                                                <span css={tw`italic text-neutral-500`}>Client inconnu</span>
                                            )}
                                        </td>
                                        <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                            {invoice.date.toLocaleDateString('fr-FR')}
                                        </td>
                                        <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>{invoice.total}</td>
                                        <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                            <Badge status={invoice.status}/>
                                        </td>
                                        <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                            {invoice.pdfUrl && (
                                                <a href={invoice.pdfUrl} target={'_blank'} rel={'noreferrer'} css={tw`text-primary-400 hover:text-primary-300`}>
                                                    PDF
                                                </a>
                                            )}
                                        </td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </table>

                        {loading && invoices.length === 0 ? (
                            <Loading/>
                        ) : invoices.length === 0 ? (
                            <NoItems/>
                        ) : null}
                    </div>

                    {hasMore && (
                        <div css={tw`flex justify-center p-4`}>
                            <Button type={'button'} isSecondary disabled={loading} onClick={() => load(cursor)}>
                                Charger plus
                            </Button>
                        </div>
                    )}
                </AdminTable>
            )}
        </AdminContentBlock>
    );
};
