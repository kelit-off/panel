import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import tw from 'twin.macro';
import { Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import { createTicket } from '@/api/account/tickets';
import { httpErrorToHuman } from '@/api/http';
import { Btn, Card, PageTitle, SelectField, TextAreaField, TextField } from '@/components/client/ui';

interface Values {
    subject: string;
    priority: string;
    message: string;
}

export default () => {
    const history = useHistory();
    const [ error, setError ] = React.useState('');

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setError('');

        createTicket(values.subject, values.message, values.priority)
            .then(ticket => history.push(`/account/tickets/${ticket.id}`))
            .catch(err => {
                console.error(err);
                setError(httpErrorToHuman(err));
                setSubmitting(false);
            });
    };

    return (
        <>
            <PageTitle title={'Nouveau ticket'} subtitle={'Décrivez votre demande, nous revenons vers vous rapidement.'}/>

            <div css={tw`max-w-2xl`}>
                <Card>
                    <Formik
                        onSubmit={submit}
                        initialValues={{ subject: '', priority: 'medium', message: '' }}
                        validationSchema={object().shape({
                            subject: string().required('Un sujet est requis.').max(191, 'Sujet trop long.'),
                            priority: string().required(),
                            message: string().required('Un message est requis.'),
                        })}
                    >
                        {({ isSubmitting }) => (
                            <Form css={tw`space-y-5`}>
                                {error && <p css={tw`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>{error}</p>}
                                <TextField name={'subject'} label={'Sujet'} placeholder={'Ex. : Mon serveur ne démarre plus'}/>
                                <SelectField name={'priority'} label={'Priorité'}>
                                    <option value={'low'}>Basse</option>
                                    <option value={'medium'}>Moyenne</option>
                                    <option value={'high'}>Haute</option>
                                </SelectField>
                                <TextAreaField name={'message'} label={'Message'} rows={7} placeholder={'Donnez-nous un maximum de détails…'}/>
                                <div css={tw`flex items-center justify-end gap-3`}>
                                    <Link to={'/account/tickets'} css={tw`text-sm font-semibold text-neutral-500 hover:text-neutral-900`}>Annuler</Link>
                                    <Btn type={'submit'} disabled={isSubmitting}>Envoyer le ticket</Btn>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>
            </div>
        </>
    );
};
