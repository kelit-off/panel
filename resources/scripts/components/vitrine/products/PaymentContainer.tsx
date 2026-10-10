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
import createSubscriptionIntent, { checkPromoCode, PromoPreview, SubscriptionIntent } from '@/api/store/createSubscriptionIntent';
import http, { httpErrorToHuman } from '@/api/http';

const formatPrice = (price: string): string => Number(price).toFixed(2).replace('.', ',');

// First-month price once a referral discount is applied.
const discounted = (price: string, percent?: number | null): string => String(Number(price) * (1 - (percent || 0) / 100));

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
                {submitting ? 'Paiement en cours…' : `Commander avec obligation de paiement — ${formatPrice(intent.product.promoPrice ?? discounted(intent.product.price, intent.product.discountPercent))} €`}
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

const Checkbox = ({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) => (
    <label css={tw`mt-3 flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-neutral-600`}>
        <input
            type={'checkbox'}
            checked={checked}
            onChange={e => onChange(e.currentTarget.checked)}
            css={tw`mt-0.5 h-4 w-4 flex-shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-400`}
        />
        <span>{children}</span>
    </label>
);

const promoDuration = (promo: PromoPreview): string => {
    if (promo.duration === 'forever') return 'à vie';
    if (promo.duration === 'repeating') return `pendant ${promo.durationInMonths} mois`;

    return 'sur le premier mois';
};

const PromoField = ({ productId, promo, onChange }: { productId: string; promo: PromoPreview | null; onChange: (promo: PromoPreview | null) => void }) => {
    const [ code, setCode ] = useState('');
    const [ checking, setChecking ] = useState(false);
    const [ error, setError ] = useState('');

    const apply = () => {
        if (!code.trim()) return;

        setChecking(true);
        setError('');
        checkPromoCode(productId, code)
            .then(onChange)
            .catch(err => setError(httpErrorToHuman(err)))
            .finally(() => setChecking(false));
    };

    if (promo) {
        return (
            <p css={tw`mt-3 flex items-center justify-between rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-semibold text-green-700`}>
                <span>Code {promo.code} appliqué : {promo.percentOff ? `−${promo.percentOff} %` : `−${formatPrice(String(promo.amountOff))} €`} {promoDuration(promo)}</span>
                <button type={'button'} onClick={() => { onChange(null); setCode(''); }} css={tw`ml-3 text-xs font-bold underline`}>Retirer</button>
            </p>
        );
    }

    return (
        <div css={tw`mt-4`}>
            <div css={tw`flex gap-2`}>
                <input
                    type={'text'}
                    value={code}
                    maxLength={40}
                    placeholder={'Code promo'}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
                    css={tw`h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 text-sm uppercase text-neutral-900 outline-none transition-colors duration-150 focus:border-primary-400`}
                />
                <button
                    type={'button'}
                    disabled={checking || !code.trim()}
                    onClick={apply}
                    css={tw`h-10 rounded-lg border border-neutral-200 px-4 text-sm font-bold text-neutral-900 transition-colors duration-150 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40`}
                >
                    {checking ? <FontAwesomeIcon icon={faSpinner} spin/> : 'Appliquer'}
                </button>
            </div>
            {error && <p css={tw`mt-2 text-sm text-red-500`}>{error}</p>}
        </div>
    );
};

const ConsentForm = ({ productId, productName, price, discountPercent, onSubmit }: { productId: string; productName: string; price: string; discountPercent?: number | null; onSubmit: (promoCode?: string) => void }) => {
    const [ promo, setPromo ] = useState<PromoPreview | null>(null);
    const [ acceptsCgv, setAcceptsCgv ] = useState(false);
    const [ immediateStart, setImmediateStart ] = useState(false);
    const ready = acceptsCgv && immediateStart;

    return (
        <>
            <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Récapitulatif</span>
            <h1 css={tw`mt-2 font-vitrine-display text-2xl font-bold text-neutral-900`}>{productName}</h1>
            <p css={tw`mt-1 text-sm text-neutral-500`}>
                {formatPrice(price)} € par mois, résiliable à tout moment depuis ton espace client.
            </p>
            <PromoField productId={productId} promo={promo} onChange={setPromo}/>
            {!!discountPercent && !promo && (
                <p css={tw`mt-3 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-semibold text-green-700`}>
                    Parrainage : −{discountPercent} % sur ton premier mois, soit {formatPrice(discounted(price, discountPercent))} € au lieu de {formatPrice(price)} €.
                </p>
            )}

            <div css={tw`mt-6 rounded-xl bg-neutral-50 p-4`}>
                <Checkbox checked={acceptsCgv} onChange={setAcceptsCgv}>
                    J&apos;ai lu et j&apos;accepte les <a href={'/cgv'} target={'_blank'} rel={'noreferrer'} css={tw`font-semibold text-primary-600`}>conditions générales de vente</a> et
                    les <a href={'/cgu'} target={'_blank'} rel={'noreferrer'} css={tw`font-semibold text-primary-600`}>conditions d&apos;utilisation</a>.
                </Checkbox>
                <Checkbox checked={immediateStart} onChange={setImmediateStart}>
                    Je demande la fourniture immédiate du service dès le paiement confirmé et je reconnais
                    perdre mon droit de rétractation de 14 jours une fois le service pleinement exécuté
                    (au prorata si je me rétracte avant, comme expliqué dans les CGV).
                </Checkbox>
            </div>

            <button
                type={'button'}
                disabled={!ready}
                onClick={() => onSubmit(promo?.code)}
                css={tw`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-600 text-sm font-bold text-white transition-colors duration-150 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40`}
            >
                Continuer vers le paiement
                <FontAwesomeIcon icon={faArrowRight}/>
            </button>
        </>
    );
};

// Fetches the plan's name and price to show on the consent step, which happens
// before an order (and therefore a SubscriptionIntent) exists yet.
const ConsentPricedForm = ({ productId, onSubmit }: { productId: string; onSubmit: (promoCode?: string) => void }) => {
    const [ product, setProduct ] = useState<{ name: string; price: string; discountPercent: number | null } | null>(null);
    const [ error, setError ] = useState('');

    useEffect(() => {
        http.get(`/api/store/products/${productId}`)
            .then(({ data }) => setProduct({ name: data.name, price: data.price, discountPercent: data.discount_percent ?? null }))
            .catch(err => setError(httpErrorToHuman(err)));
    }, [ productId ]);

    if (error) {
        return <p css={tw`text-center text-sm text-red-500`}>{error}</p>;
    }

    if (!product) {
        return (
            <p css={tw`text-center text-sm text-neutral-400`}>
                <FontAwesomeIcon icon={faSpinner} spin css={tw`mr-2`}/>
                Chargement…
            </p>
        );
    }

    return <ConsentForm productId={productId} productName={product.name} price={product.price} discountPercent={product.discountPercent} onSubmit={onSubmit}/>;
};

type Step = 'configure' | 'auth' | 'consent' | 'payment';

export default () => {
    const { productId } = useParams<{ productId: string }>();
    const isLoggedIn = useStoreState((state: ApplicationStore) => !!state.user.data);
    const [ step, setStep ] = useState<Step | null>(null);
    const [ intent, setIntent ] = useState<SubscriptionIntent | null>(null);
    const [ stripePromise, setStripePromise ] = useState<Promise<Stripe | null> | null>(null);
    const [ error, setError ] = useState('');
    const [ preparing, setPreparing ] = useState(false);

    // A name saved before an auth redirect means the visitor already went
    // through the "configure" step once; skip straight past it, either to
    // consent (now logged in) or back to the auth choice (still not).
    useEffect(() => {
        const storedName = sessionStorage.getItem(nameStorageKey(productId));

        setStep(storedName ? (isLoggedIn ? 'consent' : 'auth') : 'configure');
    }, [ productId, isLoggedIn ]);

    const onConfigured = (name: string) => {
        sessionStorage.setItem(nameStorageKey(productId), name);
        setStep(isLoggedIn ? 'consent' : 'auth');
    };

    const onConsented = (promoCode?: string) => {
        const name = sessionStorage.getItem(nameStorageKey(productId));
        if (!name) return;

        setPreparing(true);
        setError('');

        createSubscriptionIntent(productId, name, true, promoCode)
            .then(data => {
                sessionStorage.removeItem(nameStorageKey(productId));
                setIntent(data);
                setStripePromise(loadStripe(data.publishableKey));
                setStep('payment');
            })
            .catch(err => setError(httpErrorToHuman(err)))
            .finally(() => setPreparing(false));
    };

    return (
        <LandingLayout>
            <section css={tw`mx-auto max-w-md px-6 py-16 lg:px-8`}>
                <div css={tw`rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm`}>
                    {step === 'configure' ? (
                        <ConfigureForm onSubmit={onConfigured}/>
                    ) : step === 'auth' ? (
                        <AuthPrompt/>
                    ) : step === 'consent' ? (
                        error ? (
                            <p css={tw`text-center text-sm text-red-500`}>{error}</p>
                        ) : preparing ? (
                            <p css={tw`text-center text-sm text-neutral-400`}>
                                <FontAwesomeIcon icon={faSpinner} spin css={tw`mr-2`}/>
                                Préparation du paiement…
                            </p>
                        ) : (
                            <ConsentPricedForm productId={productId} onSubmit={onConsented}/>
                        )
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
                                {intent.product.promoPrice
                                    ? `${formatPrice(intent.product.promoPrice)} € avec ton code promo (au lieu de ${formatPrice(intent.product.price)} €), résiliable à tout moment.`
                                    : intent.product.discountPercent
                                    ? `${formatPrice(discounted(intent.product.price, intent.product.discountPercent))} € le premier mois (−${intent.product.discountPercent} % parrainage), puis ${formatPrice(intent.product.price)} € par mois, résiliable à tout moment.`
                                    : `${formatPrice(intent.product.price)} € facturés chaque mois, résiliable à tout moment.`}
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
