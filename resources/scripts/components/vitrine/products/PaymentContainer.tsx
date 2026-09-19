import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faUserPlus, faSignInAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import createSubscriptionIntent, { SubscriptionIntent } from '@/api/store/createSubscriptionIntent';
import { httpErrorToHuman } from '@/api/http';

const formatPrice = (price: string): string => Number(price).toFixed(2).replace('.', ',');

// The server name is chosen before the visitor is asked to log in or create
// an account, so it needs to survive the full-page redirect to /auth/login
// or /auth/register and back. sessionStorage (rather than component state)
// is what makes that survive the navigation.
const nameStorageKey = (productId: string) => `checkout:server-name:${productId}`;

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

const authButtonStyle = [
    tw`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors duration-150`,
];

const AuthPrompt = () => {
    const location = useLocation();
    const query = `?redirect_to=${encodeURIComponent(location.pathname)}`;

    return (
        <>
            <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Paiement</span>
            <h1 css={tw`mt-2 font-vitrine-display text-2xl font-bold text-neutral-900`}>Connecte-toi pour continuer</h1>
            <p css={tw`mt-1 text-sm text-neutral-500`}>
                Un compte est nécessaire pour finaliser ta commande et gérer ton serveur ensuite.
            </p>

            <Link
                to={`/auth/login${query}`}
                css={[ ...authButtonStyle, tw`bg-primary-600 text-white hover:bg-primary-700` ]}
            >
                <FontAwesomeIcon icon={faSignInAlt}/>
                Se connecter
            </Link>
            <Link
                to={`/auth/register${query}`}
                css={[ ...authButtonStyle, tw`border border-neutral-200 text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50` ]}
            >
                <FontAwesomeIcon icon={faUserPlus}/>
                Créer un compte
            </Link>
        </>
    );
};

const ConfigureForm = ({ onSubmit }: { onSubmit: (name: string) => void }) => {
    const [ name, setName ] = useState('');
    const [ error, setError ] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = name.trim();
        if (trimmed.length < 1 || trimmed.length > 60) {
            setError('Le nom du serveur doit contenir entre 1 et 60 caractères.');

            return;
        }

        onSubmit(trimmed);
    };

    return (
        <form onSubmit={submit}>
            <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Configuration</span>
            <h1 css={tw`mt-2 font-vitrine-display text-2xl font-bold text-neutral-900`}>Nomme ton serveur</h1>
            <p css={tw`mt-1 text-sm text-neutral-500`}>Tu pourras toujours le renommer plus tard.</p>

            <input
                autoFocus
                type={'text'}
                value={name}
                maxLength={60}
                placeholder={'Mon super serveur'}
                onChange={e => setName(e.target.value)}
                css={tw`mt-6 h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm text-neutral-900 outline-none transition-colors duration-150 focus:border-primary-400`}
            />
            {error && (
                <p css={tw`mt-2 text-sm text-red-500`}>{error}</p>
            )}

            <button
                type={'submit'}
                css={tw`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-600 text-sm font-bold text-white transition-colors duration-150 hover:bg-primary-700`}
            >
                Continuer
                <FontAwesomeIcon icon={faArrowRight}/>
            </button>
        </form>
    );
};

type Step = 'configure' | 'auth' | 'payment';

export default () => {
    const { productId } = useParams<{ productId: string }>();
    const isLoggedIn = useStoreState((state: ApplicationStore) => !!state.user.data);
    const [ step, setStep ] = useState<Step | null>(null);
    const [ intent, setIntent ] = useState<SubscriptionIntent | null>(null);
    const [ stripePromise, setStripePromise ] = useState<Promise<Stripe | null> | null>(null);
    const [ error, setError ] = useState('');

    // A name saved before an auth redirect means the visitor already went
    // through the "configure" step once; skip straight past it, either to
    // payment (now logged in) or back to the auth choice (still not).
    useEffect(() => {
        const storedName = sessionStorage.getItem(nameStorageKey(productId));

        setStep(storedName ? (isLoggedIn ? 'payment' : 'auth') : 'configure');
    }, [ productId, isLoggedIn ]);

    useEffect(() => {
        if (step !== 'payment') return;

        const name = sessionStorage.getItem(nameStorageKey(productId));
        if (!name) return;

        createSubscriptionIntent(productId, name)
            .then(data => {
                sessionStorage.removeItem(nameStorageKey(productId));
                setIntent(data);
                setStripePromise(loadStripe(data.publishableKey));
            })
            .catch(err => setError(httpErrorToHuman(err)));
    }, [ productId, step ]);

    const onConfigured = (name: string) => {
        sessionStorage.setItem(nameStorageKey(productId), name);
        setStep(isLoggedIn ? 'payment' : 'auth');
    };

    return (
        <LandingLayout>
            <section css={tw`mx-auto max-w-md px-6 py-16 lg:px-8`}>
                <div css={tw`rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm`}>
                    {step === 'configure' ? (
                        <ConfigureForm onSubmit={onConfigured}/>
                    ) : step === 'auth' ? (
                        <AuthPrompt/>
                    ) : error ? (
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
