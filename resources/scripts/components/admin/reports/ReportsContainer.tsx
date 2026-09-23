import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEnvelope, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { ContentReport, getReports, respondToReport } from '@/api/admin/reports';

const card = tw`rounded-xl border border-white border-opacity-5 bg-neutral-800`;

const categoryLabels: Record<string, string> = {
    illicite: 'Contenu illicite',
    ddos: 'Attaque réseau / DDoS',
    minage: 'Minage non autorisé',
    spam: 'Spam',
    propriete_intellectuelle: 'Propriété intellectuelle',
    autre: 'Autre',
};

const ReportRow = ({ report, onResolved }: { report: ContentReport; onResolved: (report: ContentReport) => void }) => {
    const [ response, setResponse ] = useState('');
    const [ submitting, setSubmitting ] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const submit = () => {
        if (!response.trim()) return;

        setSubmitting(true);
        clearFlashes('reports');

        respondToReport(report.id, response.trim())
            .then(onResolved)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'reports', error });
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <div css={[ card, tw`p-5` ]}>
            <div css={tw`flex flex-wrap items-start justify-between gap-3`}>
                <div>
                    <span
                        css={[
                            tw`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold`,
                            report.status === 'open' ? tw`bg-yellow-500 bg-opacity-20 text-yellow-300` : tw`bg-green-500 bg-opacity-20 text-green-300`,
                        ]}
                    >
                        <FontAwesomeIcon icon={report.status === 'open' ? faExclamationTriangle : faCheck}/>
                        {report.status === 'open' ? 'À traiter' : 'Traité'}
                    </span>
                    <h3 css={tw`mt-2 font-header text-sm font-bold text-neutral-100`}>
                        {categoryLabels[report.category] || report.category} — {report.target}
                    </h3>
                    <p css={tw`mt-0.5 text-xs text-neutral-400`}>
                        Signalé par {report.reporterName} ({report.reporterEmail}) le {report.createdAt.toLocaleDateString('fr-FR')}
                    </p>
                </div>
            </div>

            <p css={tw`mt-4 whitespace-pre-line text-sm text-neutral-300`}>{report.description}</p>

            {report.status === 'processed' ? (
                <div css={tw`mt-4 rounded-lg bg-white bg-opacity-5 px-4 py-3`}>
                    <p css={tw`flex items-center gap-2 text-xs font-semibold text-neutral-400`}>
                        <FontAwesomeIcon icon={faEnvelope}/> Réponse envoyée{report.handledBy ? ` par ${report.handledBy}` : ''}
                    </p>
                    <p css={tw`mt-1.5 whitespace-pre-line text-sm text-neutral-200`}>{report.adminResponse}</p>
                </div>
            ) : (
                <div css={tw`mt-4`}>
                    <textarea
                        value={response}
                        onChange={e => setResponse(e.target.value)}
                        placeholder={'Réponse motivée envoyée au signalant (mesure prise ou explication)…'}
                        css={tw`h-24 w-full rounded-lg border border-white border-opacity-10 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-primary-500 focus:outline-none`}
                    />
                    <button
                        type={'button'}
                        disabled={submitting || !response.trim()}
                        onClick={submit}
                        css={tw`mt-2 inline-flex h-9 items-center rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        {submitting ? 'Envoi…' : 'Répondre et clôturer'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ reports, setReports ] = useState<ContentReport[] | null>(null);

    useEffect(() => {
        clearFlashes('reports');

        getReports()
            .then(setReports)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'reports', error });
            });
    }, []);

    const onResolved = (updated: ContentReport) => {
        setReports(current => (current ? current.map(r => (r.id === updated.id ? updated : r)) : current));
    };

    const open = reports?.filter(r => r.status === 'open') ?? [];
    const processed = reports?.filter(r => r.status === 'processed') ?? [];

    return (
        <AdminContentBlock title={'Signalements'}>
            <div css={tw`mb-6`}>
                <h2 css={tw`font-header text-2xl font-extrabold tracking-tight text-neutral-50`}>Signalements</h2>
                <p css={tw`mt-1 text-base text-neutral-400`}>
                    Contenus signalés par le formulaire public — obligation LCEN et DSA de traçabilité et de réponse motivée.
                </p>
            </div>

            <FlashMessageRender byKey={'reports'} css={tw`mb-4`}/>

            {!reports ? (
                <div css={tw`flex w-full items-center justify-center`} style={{ height: '12rem' }}>
                    <Spinner size={'base'}/>
                </div>
            ) : reports.length === 0 ? (
                <div css={[ card, tw`px-5 py-10 text-center text-sm text-neutral-400` ]}>Aucun signalement pour le moment.</div>
            ) : (
                <div css={tw`space-y-4`}>
                    {open.map(report => <ReportRow key={report.id} report={report} onResolved={onResolved}/>)}
                    {processed.map(report => <ReportRow key={report.id} report={report} onResolved={onResolved}/>)}
                </div>
            )}
        </AdminContentBlock>
    );
};
