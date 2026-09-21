import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import getNestProducts, { StoreNestProduct, StoreNestProducts } from '@/api/vitrine/getNestProducts';
import { httpErrorToHuman } from '@/api/http';
import { formatCpu } from '@/helpers';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import useDocumentTitle from '@/plugins/useDocumentTitle';

const formatSize = (mb: number): string => (
    mb >= 1024 ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} Go` : `${mb} Mo`
);

const formatPrice = (price: string): string => Number(price).toFixed(2).replace('.', ',');

const specs = (product: StoreNestProduct): [ string, string ][] => [
    [ 'RAM', formatSize(product.memory) ],
    [ 'CPU', product.cpu === 0 ? 'Illimité' : formatCpu(product.cpu) ],
    [ 'Disque', formatSize(product.disk) ],
    [ 'Bases de données', String(product.databases) ],
    [ 'Sauvegardes', String(product.backups) ],
    [ 'Ports', String(product.allocations) ],
];

// Columns follow the number of plans so a row is never left with a single orphan
// card: four plans sit in a 2x2 grid, then a single row of four on wide screens.
const gridStyle = (count: number) => {
    if (count === 1) return tw`mx-auto max-w-sm grid-cols-1`;
    if (count === 2) return tw`mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2`;
    if (count === 3) return tw`grid-cols-1 lg:grid-cols-3`;
    if (count === 4) return tw`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`;

    return tw`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
};

const PlanCard = ({ product, featured }: { product: StoreNestProduct; featured: boolean }) => (
    <div
        css={[
            tw`relative flex flex-col rounded-2xl border p-6 transition-shadow duration-200 hover:shadow-lg`,
            featured ? tw`border-[#0f1729] bg-[#0f1729] text-white` : tw`border-neutral-200 bg-white text-neutral-900`,
        ]}
    >
        <div css={tw`flex items-start justify-between gap-3`}>
            <h3 css={tw`text-lg font-bold`}>{product.name}</h3>
            {featured && (
                <span css={tw`flex-shrink-0 rounded-full bg-primary-600 px-2.5 py-1 text-xs font-bold text-white`}>
                    Populaire
                </span>
            )}
        </div>

        {product.description && (
            <p css={[ tw`mt-1.5 text-sm leading-relaxed`, featured ? tw`text-[#8b98ad]` : tw`text-neutral-500` ]}>
                {product.description}
            </p>
        )}

        <div css={tw`mt-5 flex items-baseline gap-1.5`}>
            <span css={tw`font-vitrine-display text-4xl font-bold tracking-tight`}>{formatPrice(product.price)} €</span>
            <span css={[ tw`text-sm font-semibold`, featured ? tw`text-[#8b98ad]` : tw`text-neutral-400` ]}>/mois</span>
        </div>

        <dl css={[ tw`mt-6 flex-1 border-t pt-4`, featured ? tw`border-white/10` : tw`border-neutral-100` ]}>
            {specs(product).map(([ label, value ]) => (
                <div key={label} css={tw`flex items-baseline justify-between gap-3 py-1.5 text-sm`}>
                    <dt css={featured ? tw`text-[#8b98ad]` : tw`text-neutral-500`}>{label}</dt>
                    <dd css={tw`font-semibold`}>{value}</dd>
                </div>
            ))}
        </dl>

        <Link
            to={`/commande/${product.id}`}
            css={[
                tw`mt-6 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition-colors duration-150`,
                featured
                    ? tw`bg-primary-600 text-white hover:bg-primary-700`
                    : tw`border border-neutral-200 text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50`,
            ]}
        >
            Commander
        </Link>
    </div>
);

export default () => {
    const { nestSlug } = useParams<{ nestSlug: string }>();
    const siteName = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const [ data, setData ] = useState<StoreNestProducts | null>(null);
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError('');

        getNestProducts(nestSlug)
            .then(setData)
            .catch(err => setError(httpErrorToHuman(err)))
            .finally(() => setLoading(false));
    }, [ nestSlug ]);

    useDocumentTitle(data ? `Serveur ${data.nest.name} | ${siteName}` : undefined);

    // With at least three plans, the middle one is highlighted as the default pick.
    const featuredIndex = data && data.products.length >= 3 ? Math.floor(data.products.length / 2) : -1;

    return (
        <LandingLayout>
            <section css={tw`mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-8`}>
                <Link
                    to={'/'}
                    css={tw`inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors duration-150 hover:text-neutral-900`}
                >
                    <FontAwesomeIcon icon={faArrowLeft} css={tw`text-xs`}/>
                    Tous les jeux
                </Link>

                {loading ? (
                    <p css={tw`mt-16 text-center text-sm text-neutral-400`}>Chargement des offres…</p>
                ) : error ? (
                    <p css={tw`mt-16 text-center text-sm text-red-500`}>{error}</p>
                ) : !data ? null : (
                    <>
                        <div css={tw`mt-8 max-w-2xl`}>
                            <h1 css={tw`font-vitrine-display text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl`}>
                                {data.nest.name}
                            </h1>
                            <p css={tw`mt-3 text-neutral-500 sm:text-lg`}>
                                {data.nest.description || 'Choisissez votre offre, le serveur est installé automatiquement après le paiement.'}
                            </p>
                        </div>

                        {data.products.length === 0 ? (
                            <p css={tw`mt-16 text-center text-sm text-neutral-400`}>
                                Aucune offre n&apos;est disponible pour ce jeu pour le moment.
                            </p>
                        ) : (
                            <>
                                <div css={[ tw`mt-10 grid gap-5`, gridStyle(data.products.length) ]}>
                                    {data.products.map((product, index) => (
                                        <PlanCard key={product.id} product={product} featured={index === featuredIndex}/>
                                    ))}
                                </div>
                                <p css={tw`mt-8 text-sm text-neutral-500`}>
                                    Anti-DDoS et stockage NVMe inclus sur toutes les offres.
                                </p>
                            </>
                        )}
                    </>
                )}
            </section>
        </LandingLayout>
    );
};
