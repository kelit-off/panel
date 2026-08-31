import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faCloudUploadAlt,
    faDatabase,
    faHdd,
    faMemory,
    faMicrochip,
    faPlug,
    faSpinner,
    faStar,
} from '@fortawesome/free-solid-svg-icons';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import getNestProducts, { StoreNestProduct, StoreNestProducts } from '@/api/store/getNestProducts';
import createCheckoutSession from '@/api/store/createCheckoutSession';
import { httpErrorToHuman } from '@/api/http';

const formatSize = (mb: number): string => (
    mb >= 1024 ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} Go` : `${mb} Mo`
);

const formatPrice = (price: string): string => Number(price).toFixed(2).replace('.', ',');

const specs = (product: StoreNestProduct) => [
    { icon: faMemory, label: 'RAM', value: formatSize(product.memory) },
    { icon: faHdd, label: 'Disque', value: formatSize(product.disk) },
    { icon: faMicrochip, label: 'CPU', value: `${product.cpu}%` },
    { icon: faDatabase, label: 'Bases de données', value: String(product.databases) },
    { icon: faCloudUploadAlt, label: 'Sauvegardes', value: String(product.backups) },
    { icon: faPlug, label: 'Emplacements réseau', value: String(product.allocations) },
];

const buttonStyle = (featured: boolean) => [
    tw`mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60`,
    featured
        ? tw`bg-primary-600 text-white hover:bg-primary-700`
        : tw`border border-neutral-200 text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50`,
];

const OrderButton = ({ product, featured }: { product: StoreNestProduct; featured: boolean }) => {
    const isLoggedIn = useStoreState((state: ApplicationStore) => !!state.user.data);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState('');

    if (!isLoggedIn) {
        return (
            <Link to={'/auth/login'} css={buttonStyle(featured)}>
                Commander
            </Link>
        );
    }

    const onOrder = () => {
        setLoading(true);
        setError('');

        createCheckoutSession(product.id)
            .then(url => {
                window.location.href = url;
            })
            .catch(err => {
                setError(httpErrorToHuman(err));
                setLoading(false);
            });
    };

    return (
        <>
            <button type={'button'} onClick={onOrder} disabled={loading} css={buttonStyle(featured)}>
                {loading && <FontAwesomeIcon icon={faSpinner} spin/>}
                {loading ? 'Redirection…' : 'Commander'}
            </button>
            {error && (
                <p css={tw`mt-2 text-center text-xs text-red-500`}>{error}</p>
            )}
        </>
    );
};

export default () => {
    const { nestId } = useParams<{ nestId: string }>();
    const [ data, setData ] = useState<StoreNestProducts | null>(null);
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError('');

        getNestProducts(nestId)
            .then(setData)
            .catch(err => setError(httpErrorToHuman(err)))
            .finally(() => setLoading(false));
    }, [ nestId ]);

    // The middle plan (if there are at least three) is highlighted as the
    // recommended option, a common convention that nudges undecided visitors.
    const featuredIndex = data && data.products.length >= 3 ? Math.floor(data.products.length / 2) : -1;

    return (
        <LandingLayout>
            <section css={tw`mx-auto max-w-6xl px-6 pb-24 pt-14 lg:px-8`}>
                <Link
                    to={'/'}
                    css={tw`inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors duration-150 hover:text-neutral-900`}
                >
                    <FontAwesomeIcon icon={faArrowLeft} css={tw`text-xs`}/>
                    Retour aux jeux
                </Link>

                {loading ? (
                    <p css={tw`mt-16 text-center text-sm text-neutral-400`}>Chargement des offres…</p>
                ) : error ? (
                    <p css={tw`mt-16 text-center text-sm text-red-500`}>{error}</p>
                ) : !data ? null : (
                    <>
                        <div css={tw`mt-6 max-w-2xl`}>
                            <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Offres</span>
                            <h1 css={tw`mt-3 font-vitrine-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl`}>
                                {data.nest.name}
                            </h1>
                            {data.nest.description && (
                                <p css={tw`mt-3 text-neutral-500`}>{data.nest.description}</p>
                            )}
                        </div>

                        {data.products.length === 0 ? (
                            <p css={tw`mt-16 text-center text-sm italic text-neutral-400`}>
                                Aucune offre n&apos;est disponible pour ce jeu pour le moment.
                            </p>
                        ) : (
                            <div css={tw`mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
                                {data.products.map((product, index) => {
                                    const featured = index === featuredIndex;

                                    return (
                                        <div
                                            key={product.id}
                                            css={[
                                                tw`relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg`,
                                                featured ? tw`border-primary-300 shadow-lg ring-1 ring-primary-100` : tw`border-neutral-200`,
                                            ]}
                                        >
                                            {featured && (
                                                <span css={tw`absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow`}>
                                                    <FontAwesomeIcon icon={faStar} css={tw`text-[10px]`}/>
                                                    Populaire
                                                </span>
                                            )}

                                            <h3 css={tw`text-lg font-bold text-neutral-900`}>{product.name}</h3>
                                            {product.description && (
                                                <p css={tw`mt-1.5 text-sm leading-relaxed text-neutral-500`}>{product.description}</p>
                                            )}

                                            <div css={tw`mt-5 flex items-baseline gap-1`}>
                                                <span css={tw`font-vitrine-display text-3xl font-bold text-neutral-900`}>
                                                    {formatPrice(product.price)} €
                                                </span>
                                                <span css={tw`text-sm font-semibold text-neutral-400`}>/mois</span>
                                            </div>

                                            <ul css={tw`mt-6 flex flex-col gap-2.5 border-t border-neutral-100 pt-5`}>
                                                {specs(product).map(spec => (
                                                    <li key={spec.label} css={tw`flex items-center gap-2.5 text-sm text-neutral-600`}>
                                                        <span css={tw`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600`}>
                                                            <FontAwesomeIcon icon={spec.icon} css={tw`text-xs`}/>
                                                        </span>
                                                        <span css={tw`font-semibold text-neutral-900`}>{spec.value}</span>
                                                        <span css={tw`text-neutral-400`}>{spec.label}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <OrderButton product={product} featured={featured}/>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </section>
        </LandingLayout>
    );
};
