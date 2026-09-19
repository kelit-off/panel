import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import AdminBox from '@/components/admin/AdminBox';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import Select from '@/components/elements/Select';
import Button from '@/components/elements/Button';
import { TextareaField } from '@/components/elements/Field';
import { Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import getTicket from '@/api/admin/tickets/getTicket';
import replyToTicket from '@/api/admin/tickets/replyToTicket';
import updateTicket from '@/api/admin/tickets/updateTicket';
import { Ticket } from '@/api/admin/tickets/getTickets';

const statusLabel: Record<string, string> = {
    open: 'Ouvert',
    answered: 'Répondu',
    'customer-reply': 'Client a répondu',
    closed: 'Fermé',
};

const Badge = ({ status }: { status: string }) => (
    <span
        css={[
            tw`inline-block rounded-full px-2 py-px text-xs font-medium text-white`,
            status === 'answered' && tw`bg-green-600`,
            status === 'customer-reply' && tw`bg-red-600`,
            status === 'open' && tw`bg-yellow-600`,
            status === 'closed' && tw`bg-neutral-600`,
        ]}
    >
        {statusLabel[status] || status}
    </span>
);

export default () => {
    const { id } = useParams<{ id: string }>();
    const ticketId = Number(id);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [ loading, setLoading ] = useState(true);
    const [ ticket, setTicket ] = useState<Ticket | undefined>();
    const [ statusSaving, setStatusSaving ] = useState(false);

    useEffect(() => {
        clearFlashes('ticket');

        getTicket(ticketId)
            .then(setTicket)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'ticket', error });
            })
            .then(() => setLoading(false));
    }, []);

    const onStatusChange = (status: string) => {
        if (!ticket) return;

        setStatusSaving(true);
        updateTicket(ticket.id, { status })
            .then(setTicket)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'ticket', error });
            })
            .then(() => setStatusSaving(false));
    };

    const submitReply = (values: { message: string }, { setSubmitting, resetForm }: FormikHelpers<{ message: string }>) => {
        if (!ticket) return;

        clearFlashes('ticket');

        replyToTicket(ticket.id, values.message)
            .then(reply => {
                setTicket({ ...ticket, status: 'answered', replies: [ ...(ticket.replies || []), reply ] });
                resetForm();
            })
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'ticket', error });
            })
            .then(() => setSubmitting(false));
    };

    if (loading || !ticket) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'ticket'} css={tw`mb-4`}/>
                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'}/>
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Ticket - ' + ticket.subject}>
            <div css={tw`w-full flex flex-row items-center justify-between mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>{ticket.subject}</h2>
                    <p css={tw`text-base text-neutral-400`}>
                        {ticket.customer?.email || 'Client inconnu'} &middot; <Badge status={ticket.status}/>
                    </p>
                </div>

                <Select
                    value={ticket.status}
                    disabled={statusSaving}
                    onChange={e => onStatusChange(e.currentTarget.value)}
                    css={tw`w-48`}
                >
                    <option value={'open'}>Ouvert</option>
                    <option value={'answered'}>Répondu</option>
                    <option value={'customer-reply'}>Client a répondu</option>
                    <option value={'closed'}>Fermé</option>
                </Select>
            </div>

            <FlashMessageRender byKey={'ticket'} css={tw`mb-4`}/>

            <AdminBox title={'Conversation'}>
                {(ticket.replies || []).map(reply => (
                    <div
                        key={reply.id}
                        css={[
                            tw`rounded p-4 mb-3`,
                            reply.isStaff ? tw`bg-primary-600 bg-opacity-10 border border-primary-500` : tw`bg-neutral-900`,
                        ]}
                    >
                        <div css={tw`flex items-center justify-between mb-2`}>
                            <p css={tw`text-sm font-medium text-neutral-200`}>
                                {reply.isStaff ? `${reply.author || 'Support'} (staff)` : reply.author}
                            </p>
                            <p css={tw`text-2xs text-neutral-400 uppercase`}>
                                {reply.createdAt.toLocaleString('fr-FR')}
                            </p>
                        </div>
                        <p css={tw`text-sm text-neutral-300 whitespace-pre-wrap break-words`}>{reply.message}</p>
                    </div>
                ))}

                <Formik
                    onSubmit={submitReply}
                    initialValues={{ message: '' }}
                    validationSchema={object().shape({
                        message: string().required('Un message est requis.'),
                    })}
                >
                    {({ isSubmitting, isValid }) => (
                        <Form css={tw`mt-4`}>
                            <TextareaField id={'message'} name={'message'} label={'Répondre en tant que support'} rows={4}/>
                            <div css={tw`mt-4 flex justify-end`}>
                                <Button type={'submit'} disabled={isSubmitting || !isValid}>
                                    Envoyer la réponse
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </AdminBox>
        </AdminContentBlock>
    );
};
