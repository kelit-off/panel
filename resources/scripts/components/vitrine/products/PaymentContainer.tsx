import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import createSubscriptionIntent, { SubscriptionIntent } from '@/api/store/createSubscriptionIntent';
import { httpErrorToHuman } from '@/api/http';

const formatPrice = (price: string): string => Number(price).toFixed(2).replace('.', ',');

const PaymentForm = ({ intent }: { intent: SubscriptionIntent }) => {
    const stripe = useStripe();
    const elements = useElements();
    const history = useHistory();
    const [ submitting, setSubmitting ] = useState(false);
    const [ error, setError ] = useState('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        setError('');

        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
            confirmParams: {
                return_url: `${window.location.origin}/commande/succes?order=${intent.order.id}`,
            },
        });

        if (confirmError) {
            setError(confirmError.message ?? 'Le paiement a échoué, merci de réessayer.');
            setSubmitting(false);

            return;
        }

        if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
            history.push(`/commande/succes?order=${intent.order.id}`);

            return;
        }

        setSubmitting(false);
    };

    return (
        <form onSubmit={onSubmit} css={tw`mt-6`}>
            <PaymentElement/>
            {error && (
                <p css={tw`mt-4 text-sm text-red-500`}>{error}</p>
            )}
            <button
                type={'submit'}
                disabled={!stripe || submitting}
                css={tw`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-600 text-sm font-bold text-white transition-colors duration-150 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60`}
            >
                {submitting && <FontAwesomeIcon icon={faSpinner} spin/>}
                {submitting ? 'Paiement en cours…' : `Payer ${formatPrice(intent.product.price)} €`}
            </button>
            <p css={tw`mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-400`}>
                <FontAwesomeIcon icon={faLock}/>
                Paiement sécurisé par Stripe
            </p>
        </form>
    );
};

export default () => {
    const { productId } = useParams<{ productId: string }>();
    const [ intent, setIntent ] = useState<SubscriptionIntent | null>(null);
    const [ stripePromise, setStripePromise ] = useState<Promise<Stripe | null> | null>(null);
    const [ error, setError ] = useState('');

    useEffect(() => {
        createSubscriptionIntent(productId)
            .then(data => {
                setIntent(data);
                setStripePromise(loadStripe(data.publishableKey));
            })
            .catch(err => setError(httpErrorToHuman(err)));
    }, [ productId ]);

    return (
        <LandingLayout>
            <section css={tw`mx-auto max-w-md px-6 py-16 lg:px-8`}>
                <div css={tw`rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm`}>
                    {error ? (
                        <p css={tw`text-center text-sm text-red-500`}>{error}</p>
                    ) : !intent || !stripePromise ? (
                        <p css={tw`text-center text-sm text-neutral-400`}>
                            <FontAwesomeIcon icon={faSpinner} spin css={tw`mr-2`}/>
                            Préparation du paiement…
                        </p>
                    ) : (
                        <>
                            <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Paiement</span>
                            <h1 css={tw`mt-2 font-vitrine-display text-2xl font-bold text-neutral-900`}>{intent.product.name}</h1>
                            <p css={tw`mt-1 text-sm text-neutral-500`}>
                                {formatPrice(intent.product.price)} € facturés chaque mois, résiliable à tout moment.
                            </p>

                            <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
                                <PaymentForm intent={intent}/>
                            </Elements>
                        </>
                    )}
                </div>
            </section>
        </LandingLayout>
    );
};
