import React from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { useInvoices } from '@/api/account/invoices';
import { Card, EmptyState, LinkButton, PageTitle, Pill, formatDate } from '@/components/client/ui';

const statuses: Record<string, { label: string; tone: 'green' | 'yellow' | 'red' | 'neutral' }> = {
    paid: { label: 'Payée', tone: 'green' },
    open: { label: 'À régler', tone: 'yellow' },
    void: { label: 'Annulée', tone: 'neutral' },
    uncollectible: { label: 'Impayée', tone: 'red' },
    draft: { label: 'Brouillon', tone: 'neutral' },
};

export default () => {
    const { data: invoices, error } = useInvoices();
    const notConfigured = (error as any)?.response?.status === 503;

    return (
        <>
            <PageTitle title={'Factures'} subtitle={'L\'historique de vos paiements, téléchargeable en PDF.'}/>

            <Card padded={false}>
                {error ? (
                    <p css={tw`p-6 text-sm text-neutral-500`}>
                        {notConfigured ? 'La facturation n\'est pas encore disponible.' : 'Impossible de charger vos factures pour le moment.'}
                    </p>
                ) : !invoices ? (
                    <p css={tw`p-6 text-sm text-neutral-400`}>Chargement…</p>
                ) : invoices.length === 0 ? (
                    <EmptyState
                        icon={faFileInvoice}
                        title={'Aucune facture pour le moment'}
                        text={'Vos factures apparaîtront ici après votre premier paiement.'}
                        action={<LinkButton to={'/'} variant={'secondary'}>Voir les offres</LinkButton>}
                    />
                ) : (
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full text-left`}>
                            <thead>
                                <tr css={tw`border-b border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-400`}>
                                    <th css={tw`px-6 py-4`}>Facture</th>
                                    <th css={tw`px-6 py-4`}>Date</th>
                                    <th css={tw`px-6 py-4`}>Montant</th>
                                    <th css={tw`px-6 py-4`}>Statut</th>
                                    <th css={tw`px-6 py-4`}/>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => {
                                    const status = statuses[invoice.status] || { label: invoice.status, tone: 'neutral' as const };

                                    return (
                                        <tr key={invoice.id} css={tw`border-b border-neutral-100 last:border-0`}>
                                            <td css={tw`px-6 py-4 text-sm font-bold text-neutral-900`}>{invoice.number || invoice.id}</td>
                                            <td css={tw`px-6 py-4 text-sm text-neutral-500`}>{formatDate(invoice.date)}</td>
                                            <td css={tw`px-6 py-4 text-sm font-semibold text-neutral-900`}>{invoice.total}</td>
                                            <td css={tw`px-6 py-4`}><Pill tone={status.tone}>{status.label}</Pill></td>
                                            <td css={tw`px-6 py-4 text-right`}>
                                                {invoice.pdfUrl && (
                                                    <a
                                                        href={`/api/client/account/billing/invoices/${invoice.id}`}
                                                        target={'_blank'}
                                                        rel={'noreferrer'}
                                                        css={tw`inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50`}
                                                    >
                                                        <FontAwesomeIcon icon={faDownload}/> PDF
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </>
    );
};
