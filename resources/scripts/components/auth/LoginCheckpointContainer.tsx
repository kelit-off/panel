import React, { useEffect, useState } from 'react';
import { StaticContext } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import loginCheckpoint from '@/api/auth/loginCheckpoint';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { Formik, FormikHelpers } from 'formik';
import useFlash from '@/plugins/useFlash';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

interface Values {
    code: string;
    recoveryCode: '',
}

export interface LoginCheckpointState {
    token: string;
    methods: string[];
    publicKey?: PublicKeyCredentialRequestOptions;
    recovery?: boolean;
}

type Props = RouteComponentProps<Record<string, string | undefined>, StaticContext, LoginCheckpointState>;

export default ({ history, location }: Props) => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const onSubmit = ({ code, recoveryCode }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        loginCheckpoint(location.state?.token || '', code, recoveryCode)
            .then(response => {
                if (response.complete) {
                    // @ts-ignore
                    window.location = response.intended || '/';
                }
            })
            .catch(error => clearAndAddHttpError({ error }))
            .then(() => setSubmitting(false));
    };

    const [ isMissingDevice, setIsMissingDevice ] = useState(false);

    useEffect(() => {
        if (!location.state?.token) {
            history.replace('/auth/login');
        }
    }, []);

    useEffect(() => {
        setIsMissingDevice(location.state?.recovery || false);
    }, [ location.state ]);

    return (
        <Formik initialValues={{ code: '', recoveryCode: '' }} onSubmit={onSubmit}>
            {({ isSubmitting, setFieldValue }) => (
                <LoginFormContainer title={'Double authentification'} subtitle={'Confirmez votre identité pour continuer.'}>
                    <div css={tw`flex flex-col h-full`}>
                        <div css={tw`flex-1 mb-12`}>
                            <Field
                                light
                                name={isMissingDevice ? 'recoveryCode' : 'code'}
                                label={isMissingDevice ? 'Code de récupération' : 'Code d\'authentification'}
                                inputMode={isMissingDevice ? undefined : 'numeric'}
                                pattern={isMissingDevice ? undefined : '[0-9]*'}
                                autoComplete={isMissingDevice ? undefined : 'one-time-code'}
                                description={
                                    isMissingDevice
                                        ? 'Saisissez l\'un des codes de récupération générés lors de l\'activation de la double authentification.'
                                        : 'Saisissez le code généré par votre application d\'authentification.'
                                }
                                type={'text'}
                                autoFocus
                            />
                        </div>
                        <Button
                            css={tw`w-full block`}
                            type={'submit'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            Valider
                        </Button>
                        {(!isMissingDevice || (isMissingDevice && (location.state?.methods || []).includes('totp'))) &&
                        <button
                            type={'button'}
                            onClick={() => {
                                setFieldValue('code', '');
                                setFieldValue('recoveryCode', '');
                                setIsMissingDevice(s => !s);
                            }}
                            css={tw`mt-4 p-2 w-full cursor-pointer text-xs text-neutral-500 tracking-wide uppercase no-underline hover:text-neutral-700`}
                        >
                            {!isMissingDevice ? 'J\'ai perdu mon appareil' : 'J\'ai mon appareil'}
                        </button>
                        }
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
