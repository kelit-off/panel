import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Actions, State, useStoreActions, useStoreState } from 'easy-peasy';
import { Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faKey, faShieldAlt, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { ApplicationStore } from '@/state';
import { updateAccountPassword } from '@/api/account';
import { httpErrorToHuman } from '@/api/http';
import SetupTwoFactorModal from '@/components/dashboard/forms/SetupTwoFactorModal';
import DisableTwoFactorModal from '@/components/dashboard/forms/DisableTwoFactorModal';
import { Btn, Card, CardTitle, PageTitle, Pill, TextField } from '@/components/client/ui';

const Message = ({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) => (
    <p css={[ tw`rounded-lg border px-4 py-3 text-sm`, tone === 'error' ? tw`border-red-200 bg-red-50 text-red-700` : tw`border-green-200 bg-green-50 text-green-700` ]}>
        {children}
    </p>
);

const EmailCard = () => {
    const user = useStoreState((state: State<ApplicationStore>) => state.user.data)!;
    const updateEmail = useStoreActions((actions: Actions<ApplicationStore>) => actions.user.updateUserEmail);
    const [ message, setMessage ] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

    const submit = (values: { email: string; password: string }, { resetForm, setSubmitting }: FormikHelpers<{ email: string; password: string }>) => {
        setMessage(null);

        updateEmail({ ...values })
            .then(() => setMessage({ tone: 'success', text: 'Votre adresse email a été mise à jour.' }))
            .catch(error => setMessage({ tone: 'error', text: httpErrorToHuman(error) }))
            .then(() => {
                resetForm();
                setSubmitting(false);
            });
    };

    return (
        <Card>
            <CardTitle>Adresse email</CardTitle>
            <Formik
                onSubmit={submit}
                initialValues={{ email: user.email, password: '' }}
                enableReinitialize
                validationSchema={object().shape({
                    email: string().email('Adresse email invalide.').required('Une adresse email est requise.'),
                    password: string().required('Votre mot de passe actuel est requis.'),
                })}
            >
                {({ isSubmitting }) => (
                    <Form css={tw`space-y-4`}>
                        {message && <Message tone={message.tone}>{message.text}</Message>}
                        <TextField name={'email'} label={'Email'} type={'email'}/>
                        <TextField name={'password'} label={'Mot de passe actuel'} type={'password'} hint={'Requis pour confirmer le changement.'}/>
                        <Btn type={'submit'} disabled={isSubmitting}>Mettre à jour l&apos;email</Btn>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

const PasswordCard = () => {
    const [ message, setMessage ] = useState('');

    const submit = (values: { current: string; password: string; confirmPassword: string }, { setSubmitting }: FormikHelpers<{ current: string; password: string; confirmPassword: string }>) => {
        setMessage('');

        updateAccountPassword({ ...values })
            .then(() => {
                // @ts-ignore
                window.location = '/auth/login';
            })
            .catch(error => setMessage(httpErrorToHuman(error)))
            .then(() => setSubmitting(false));
    };

    return (
        <Card>
            <CardTitle>Mot de passe</CardTitle>
            <Formik
                onSubmit={submit}
                initialValues={{ current: '', password: '', confirmPassword: '' }}
                validationSchema={object().shape({
                    current: string().required('Votre mot de passe actuel est requis.'),
                    password: string().min(8, '8 caractères minimum.').required('Un nouveau mot de passe est requis.'),
                    confirmPassword: string().test('match', 'La confirmation ne correspond pas.', function (value) {
                        return value === this.parent.password;
                    }),
                })}
            >
                {({ isSubmitting }) => (
                    <Form css={tw`space-y-4`}>
                        {message && <Message tone={'error'}>{message}</Message>}
                        <TextField name={'current'} label={'Mot de passe actuel'} type={'password'}/>
                        <TextField name={'password'} label={'Nouveau mot de passe'} type={'password'} hint={'8 caractères minimum. Vous serez déconnecté après le changement.'}/>
                        <TextField name={'confirmPassword'} label={'Confirmer le nouveau mot de passe'} type={'password'}/>
                        <Btn type={'submit'} disabled={isSubmitting}>Changer le mot de passe</Btn>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

const TwoFactorCard = () => {
    const [ visible, setVisible ] = useState(false);
    const isEnabled = useStoreState((state: ApplicationStore) => state.user.data!.useTotp);

    return (
        <Card>
            {visible && (
                isEnabled ?
                    <DisableTwoFactorModal visible={visible} onModalDismissed={() => setVisible(false)}/>
                    :
                    <SetupTwoFactorModal visible={visible} onModalDismissed={() => setVisible(false)}/>
            )}
            <CardTitle action={<Pill tone={isEnabled ? 'green' : 'neutral'}>{isEnabled ? 'Activée' : 'Désactivée'}</Pill>}>
                Double authentification
            </CardTitle>
            <p css={tw`text-sm leading-relaxed text-neutral-500`}>
                {isEnabled
                    ? 'La double authentification protège votre compte : un code temporaire est demandé à chaque connexion.'
                    : 'Ajoutez une couche de sécurité : un code temporaire (application d\'authentification) sera demandé à chaque connexion.'}
            </p>
            <div css={tw`mt-5`}>
                <Btn type={'button'} variant={isEnabled ? 'secondary' : 'primary'} onClick={() => setVisible(true)}>
                    {isEnabled ? 'Désactiver' : 'Activer'}
                </Btn>
            </div>
        </Card>
    );
};

const AccessCard = () => {
    const rows = [
        { to: '/account/api', icon: faKey, title: 'Clés API', text: 'Accès programmatique à votre compte.' },
        { to: '/account/keys/ssh', icon: faTerminal, title: 'Clés SSH', text: 'Connexion SFTP sans mot de passe.' },
        { to: '/account/keys/security', icon: faShieldAlt, title: 'Clés de sécurité', text: 'Authentification matérielle (WebAuthn).' },
    ];

    return (
        <Card padded={false}>
            <div css={tw`px-6 pt-6`}><CardTitle>Accès avancés</CardTitle></div>
            <ul>
                {rows.map(row => (
                    <li key={row.to} css={tw`border-t border-neutral-100`}>
                        <Link to={row.to} css={tw`flex items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-neutral-50`}>
                            <div css={tw`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500`}>
                                <FontAwesomeIcon icon={row.icon}/>
                            </div>
                            <div css={tw`flex-1`}>
                                <p css={tw`text-sm font-bold text-neutral-900`}>{row.title}</p>
                                <p css={tw`text-xs text-neutral-500`}>{row.text}</p>
                            </div>
                            <FontAwesomeIcon icon={faChevronRight} css={tw`text-xs text-neutral-300`}/>
                        </Link>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default () => (
    <>
        <PageTitle title={'Paramètres du compte'} subtitle={'Gérez vos informations de connexion et la sécurité de votre compte.'}/>
        <div css={tw`grid grid-cols-1 gap-6 lg:grid-cols-2`}>
            <EmailCard/>
            <PasswordCard/>
            <TwoFactorCard/>
            <AccessCard/>
        </div>
    </>
);
