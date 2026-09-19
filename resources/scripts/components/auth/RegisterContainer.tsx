import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import register from '@/api/auth/register';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';

interface Values {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

const RegisterContainer = ({ location }: RouteComponentProps) => {
    const ref_ = useRef<Reaptcha | null>(null);
    const [ token, setToken ] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState(state => state.settings.data!.recaptcha);

    const redirectTo = new URLSearchParams(location.search).get('redirect_to');
    const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : '';

    useEffect(() => {
        clearFlashes(undefined);
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes(undefined);

        if (recaptchaEnabled && !token) {
            ref_.current!.execute().catch(error => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
            return;
        }

        register({ ...values, recaptchaData: token })
            .then(response => {
                if (response.complete) {
                    // @ts-ignore
                    window.location = redirectTo || response.intended || '/';
                }
            })
            .catch(async (error) => {
                console.error(error);

                setToken('');
                if (ref_.current) await ref_.current?.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', email: '', password: '', passwordConfirmation: '' }}
            validationSchema={object().shape({
                username: string().required('Un nom d\'utilisateur est requis.'),
                email: string().email('Merci de fournir une adresse email valide.').required('Une adresse email est requise.'),
                password: string().required('Un mot de passe est requis.')
                    .min(8, 'Votre mot de passe doit contenir au moins 8 caractères.'),
                passwordConfirmation: string()
                    .required('La confirmation du mot de passe ne correspond pas.')
                    // @ts-ignore
                    .oneOf([ ref('password'), null ], 'La confirmation du mot de passe ne correspond pas.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={'Créer un compte'} subtitle={'Un compte suffit pour commander et gérer vos services.'}>
                    <Field
                        light
                        type={'text'}
                        label={'Nom d\'utilisateur'}
                        name={'username'}
                        disabled={isSubmitting}
                    />
                    <div css={tw`mt-6`}>
                        <Field
                            light
                            type={'email'}
                            label={'Email'}
                            name={'email'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            light
                            type={'password'}
                            label={'Mot de passe'}
                            name={'password'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            light
                            type={'password'}
                            label={'Confirmer le mot de passe'}
                            name={'passwordConfirmation'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button type={'submit'} size={'xlarge'} isLoading={isSubmitting} disabled={isSubmitting}>
                            Créer mon compte
                        </Button>
                    </div>
                    {recaptchaEnabled &&
                    <Reaptcha
                        ref={ref_}
                        size={'invisible'}
                        sitekey={siteKey || '_invalid_key'}
                        onVerify={async (response) => {
                            setToken(response);
                            await submitForm();
                        }}
                        onExpire={() => {
                            setSubmitting(false);
                            setToken('');
                        }}
                    />
                    }
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={`/auth/login${query}`}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Déjà un compte ? Se connecter
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default RegisterContainer;
