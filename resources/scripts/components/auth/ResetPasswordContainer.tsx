import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { parse } from 'query-string';
import { Link } from 'react-router-dom';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [ email, setEmail ] = useState('');

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const parsed = parse(location.search);
    if (email.length === 0 && parsed.email) {
        setEmail(parsed.email as string);
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes(undefined);
        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation })
            .then(() => {
                // @ts-ignore
                window.location = '/';
            })
            .catch(error => {
                console.error(error);

                setSubmitting(false);
                addFlash({ type: 'error', title: 'Erreur', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={object().shape({
                password: string().required('Un nouveau mot de passe est requis.')
                    .min(8, '8 caractères minimum.'),
                passwordConfirmation: string()
                    .required('La confirmation ne correspond pas.')
                    // @ts-ignore
                    .oneOf([ ref('password'), null ], 'La confirmation ne correspond pas.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer
                    title={'Nouveau mot de passe'}
                    subtitle={'Choisissez un mot de passe sécurisé.'}
                >
                    <div>
                        <label css={tw`mb-1.5 block text-sm font-semibold text-neutral-700`}>Adresse email</label>
                        <Input value={email} isLight disabled/>
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            light
                            label={'Nouveau mot de passe'}
                            name={'password'}
                            type={'password'}
                            description={'8 caractères minimum.'}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            light
                            label={'Confirmer le mot de passe'}
                            name={'passwordConfirmation'}
                            type={'password'}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button
                            size={'xlarge'}
                            type={'submit'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            Réinitialiser le mot de passe
                        </Button>
                    </div>
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Retour à la connexion
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
