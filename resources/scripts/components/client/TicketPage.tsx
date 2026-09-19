import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import { closeTicket, replyToTicket, useTicket } from '@/api/account/tickets';
import { httpErrorToHuman } from '@/api/http';
import { Btn, Card, Pill, TextAreaField, formatDateTime } from '@/components/client/ui';
import { ticketStatus } from '@/components/client/ticketStatus';

export default () => {
    const { id } = useParams<{ id: string }>();
    const ticketId = Number(id);
    const { data: ticket, mutate, error: loadError } = useTicket(ticketId);
    const [ error, setError ] = useState('');
    const [ closing, setClosing ] = useState(false);

    const submitReply = (values: { message: string }, { setSubmitting, resetForm }: FormikHelpers<{ message: string }>) => {
        setError('');

        replyToTicket(ticketId, values.message)
            .then(reply => {
                mutate(data => data && ({ ...data, status: 'customer-reply', replies: [ ...(data.replies || []), reply ] }), false);
                resetForm();
            })
            .catch(err => setError(httpErrorToHuman(err)))
            .then(() => setSubmitting(false));
    };

    const onClose = () => {
        setClosing(true);
        setError('');

        closeTicket(ticketId)
            .then(updated => mutate(data => data && ({ ...data, status: updated.status }), false))
            .catch(err => setError(httpErrorToHuman(err)))
            .then(() => setClosing(false));
    };

    const back = (
        <Link to={'/account/tickets'} css={tw`mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900`}>
            <FontAwesomeIcon icon={faChevronLeft} css={tw`text-xs`}/> Retour aux tickets
        </Link>
    );

    if (loadError) {
        return <>{back}<Card><p css={tw`text-sm text-red-600`}>Ce ticket est introuvable.</p></Card></>;
    }

    if (!ticket) {
        return <>{back}<Card><p css={tw`text-sm text-neutral-400`}>Chargement…</p></Card></>;
    }

    const status = ticketStatus(ticket.status);

    return (
        <>
            {back}

            <div css={tw`mb-6 flex flex-wrap items-start justify-between gap-4`}>
                <div>
                    <h1 css={tw`font-vitrine-display text-2xl font-bold tracking-tight text-neutral-900`}>{ticket.subject}</h1>
                    <div css={tw`mt-2 flex items-center gap-3 text-sm text-neutral-500`}>
                        <Pill tone={status.tone}>{status.label}</Pill>
                        <span>Ticket #{ticket.id} &middot; ouvert le {formatDateTime(ticket.createdAt)}</span>
                    </div>
                </div>
                {ticket.status !== 'closed' && (
                    <Btn type={'button'} variant={'secondary'} onClick={onClose} disabled={closing}>Fermer le ticket</Btn>
                )}
            </div>

            <div css={tw`max-w-3xl space-y-4`}>
                {(ticket.replies || []).map(reply => (
                    <div key={reply.id} css={[ tw`flex`, !reply.isStaff && tw`justify-end` ]}>
                        <div
                            css={[
                                tw`w-full max-w-[85%] rounded-2xl border px-5 py-4`,
                                reply.isStaff ? tw`border-primary-200 bg-primary-50` : tw`border-neutral-200 bg-white shadow-sm`,
                            ]}
                        >
                            <div css={tw`mb-1.5 flex items-center justify-between gap-4`}>
                                <p css={tw`text-sm font-bold text-neutral-900`}>{reply.isStaff ? 'Support' : (reply.author || 'Vous')}</p>
                                <p css={tw`text-xs text-neutral-400`}>{formatDateTime(reply.createdAt)}</p>
                            </div>
                            <p css={tw`whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700`}>{reply.message}</p>
                        </div>
                    </div>
                ))}

                {ticket.status === 'closed' ? (
                    <p css={tw`rounded-xl border border-neutral-200 bg-neutral-100 px-5 py-4 text-center text-sm text-neutral-500`}>
                        Ce ticket est fermé. Ouvrez-en un nouveau si vous avez besoin d&apos;aide.
                    </p>
                ) : (
                    <Card>
                        <Formik
                            onSubmit={submitReply}
                            initialValues={{ message: '' }}
                            validationSchema={object().shape({ message: string().required('Un message est requis.') })}
                        >
                            {({ isSubmitting }) => (
                                <Form css={tw`space-y-4`}>
                                    {error && <p css={tw`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>{error}</p>}
                                    <TextAreaField name={'message'} label={'Votre réponse'} rows={4}/>
                                    <div css={tw`flex justify-end`}>
                                        <Btn type={'submit'} disabled={isSubmitting}>Envoyer</Btn>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </Card>
                )}
            </div>
        </>
    );
};
