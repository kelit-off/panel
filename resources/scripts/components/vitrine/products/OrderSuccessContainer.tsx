import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import getOrder, { StoreOrder } from '@/api/store/getOrder';
import { httpErrorToHuman } from '@/api/http';

// The order status moves pending -> paid -> active (server ready) or failed;
// keep polling while it's still in one of the "in progress" states.
const isSettled = (status: StoreOrder['status']) => status === 'active' || status === 'failed' || status === 'cancelled';

export default () => {
    const orderId = new URLSearchParams(useLocation().search).get('order');
    const [ order, setOrder ] = useState<StoreOrder | null>(null);
    const [ error, setError ] = useState('');
    const intervalRef = useRef<number>();

    useEffect(() => {
        if (!orderId) {
            setError('Aucune commande n\'a été trouvée.');

            return;
        }

        const poll = () => {
            getOrder(orderId)
                .then(data => {
                    setOrder(data);

                    if (isSettled(data.status)) {
                        window.clearInterval(intervalRef.current);
                    }
                })
                .catch(err => {
                    setError(httpErrorToHuman(err));
                    window.clearInterval(intervalRef.current);
                });
        };

        poll();
        intervalRef.current = window.setInterval(poll, 3000);

        return () => window.clearInterval(intervalRef.current);
    }, [ orderId ]);

    return (
        <LandingLayout>
            <section css={tw`mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center lg:px-8`}>
                {error ? (
                    <>
                        <FontAwesomeIcon icon={faExclamationTriangle} css={tw`text-4xl text-red-500`}/>
                        <h1 css={tw`mt-5 font-vitrine-display text-2xl font-bold text-neutral-900`}>Une erreur est survenue</h1>
                        <p css={tw`mt-2 text-neutral-500`}>{error}</p>
                    </>
                ) : !order || !isSettled(order.status) ? (
                    <>
                        <FontAwesomeIcon icon={faSpinner} spin css={tw`text-4xl text-primary-600`}/>
                        <h1 css={tw`mt-5 font-vitrine-display text-2xl font-bold text-neutral-900`}>
                            Paiement confirmé, préparation de ton serveur…
                        </h1>
                        <p css={tw`mt-2 text-neutral-500`}>
                            Ça ne prend généralement que quelques secondes, merci de patienter.
                        </p>
                    </>
                ) : order.status === 'active' ? (
                    <>
                        <FontAwesomeIcon icon={faCheckCircle} css={tw`text-4xl text-green-500`}/>
                        <h1 css={tw`mt-5 font-vitrine-display text-2xl font-bold text-neutral-900`}>Ton serveur est prêt !</h1>
                        <p css={tw`mt-2 text-neutral-500`}>
                            Tu peux dès maintenant le configurer depuis ton espace client.
                        </p>
                        <Link
                            to={'/auth/login'}
                            css={tw`mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary-600 px-6 text-sm font-bold text-white transition-colors duration-150 hover:bg-primary-700`}
                        >
                            Accéder à mon espace client
                        </Link>
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faExclamationTriangle} css={tw`text-4xl text-yellow-500`}/>
                        <h1 css={tw`mt-5 font-vitrine-display text-2xl font-bold text-neutral-900`}>
                            Ton paiement est confirmé
                        </h1>
                        <p css={tw`mt-2 text-neutral-500`}>
                            La création automatique de ton serveur a rencontré un souci. Notre équipe a été
                            notifiée et va s&apos;en occuper manuellement — tu n&apos;as rien à refaire.
                        </p>
                    </>
                )}
            </section>
        </LandingLayout>
    );
};
