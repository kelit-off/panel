import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import FaqItem from '@/components/vitrine/components/FaqItem';
import useDocumentTitle from '@/plugins/useDocumentTitle';
import { accentStyles, nestVisual } from '@/components/vitrine/components/GamesDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faHeadset, faServer, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const inclusionIcons: Record<string, IconDefinition> = {
    nvme: faBoxOpen,
    shield: faShieldAlt,
    auto: faServer,
    support: faHeadset,
};

export default () => {
    const accountLink = useStoreState((state: ApplicationStore) => (state.user.data ? '/account' : '/auth/login'));
    const categories = useStoreState((state: ApplicationStore) => state.settings.data?.categories ?? []);
    const nests = categories.flatMap(category => category.nests);
    const hero = useStoreState((state: ApplicationStore) => state.settings.data!.hero);
    const faqs = useStoreState((state: ApplicationStore) => state.settings.data!.faqs);
    const inclusions = useStoreState((state: ApplicationStore) => state.settings.data!.inclusions);
    const siteName = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    useDocumentTitle(`${siteName} : location de serveurs de jeu, en ligne en quelques minutes`);

    return (
        <LandingLayout>
            <section css={tw`mx-auto max-w-3xl px-6 pb-16 pt-20 text-center lg:pt-28`}>
                <h1 css={tw`font-vitrine-display text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl`}>
                    {hero.title}
                </h1>
                <p css={tw`mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-500 sm:text-lg`}>
                    {hero.text}
                </p>
                <div css={tw`mt-8 flex flex-wrap justify-center gap-3`}>
                    <a
                        href={'#jeux'}
                        css={tw`inline-flex h-12 items-center justify-center rounded-full bg-primary-600 px-7 text-sm font-bold text-white transition-colors duration-150 hover:bg-primary-700`}
                    >
                        Choisir un jeu
                    </a>
                    <Link
                        to={accountLink}
                        css={tw`inline-flex h-12 items-center justify-center rounded-full border border-neutral-200 bg-white px-7 text-sm font-bold text-neutral-900 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50`}
                    >
                        Espace client
                    </Link>
                </div>
            </section>

            <section id={'jeux'} css={[ tw`mx-auto max-w-6xl px-6 pb-20 lg:px-8`, { scrollMarginTop: '6rem' } ]}>
                <h2 css={tw`text-center font-vitrine-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl`}>
                    À quel jeu voulez-vous jouer ?
                </h2>

                {nests.length === 0 ? (
                    <p css={tw`mt-10 text-center text-sm text-neutral-400`}>
                        Les jeux seront affichés ici dès qu&apos;un jeu sera configuré.
                    </p>
                ) : (
                    <div css={tw`mt-10 flex flex-wrap justify-center gap-4`}>
                        {nests.map(nest => {
                            const visual = nestVisual(nest.name);
                            const accent = accentStyles[visual.accent];

                            return (
                                <Link
                                    key={nest.id}
                                    to={`/jeu/${nest.slug}`}
                                    css={tw`flex w-full items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition duration-200 hover:border-neutral-300 hover:shadow-lg sm:w-60`}
                                >
                                    {visual.icon ? (
                                        <span css={[ tw`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-neutral-50 text-xl`, accent.iconText ]}>
                                            <FontAwesomeIcon icon={visual.icon}/>
                                        </span>
                                    ) : (
                                        <span css={[ tw`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-base font-bold text-white`, accent.avatarBg ]}>
                                            {visual.letter}
                                        </span>
                                    )}
                                    <span css={tw`min-w-0`}>
                                        <strong css={tw`block truncate text-base font-bold text-neutral-900`}>{nest.name}</strong>
                                        <span css={tw`mt-0.5 block text-sm text-neutral-500`}>
                                            {nest.fromPrice
                                                ? `Dès ${Number(nest.fromPrice).toFixed(2).replace('.', ',')} €/mois`
                                                : 'Voir les offres'}
                                        </span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            <section css={tw`border-b border-t border-neutral-200 bg-white px-6 py-14 lg:px-8`}>
                <ul css={tw`mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4`}>
                    {inclusions.map(({ key, title, description }) => (
                        <li key={key} css={tw`flex gap-4`}>
                            <span css={tw`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600`}>
                                <FontAwesomeIcon icon={inclusionIcons[key] || faBoxOpen}/>
                            </span>
                            <span>
                                <strong css={tw`block text-[15px] font-bold text-neutral-900`}>{title}</strong>
                                <span css={tw`mt-1 block text-sm leading-relaxed text-neutral-500`}>{description}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section id={'faq'} css={[ tw`px-6 py-20 lg:px-8`, { scrollMarginTop: '6rem' } ]}>
                <h2 css={tw`text-center font-vitrine-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl`}>
                    Questions fréquentes
                </h2>

                <div css={tw`mx-auto mt-10 flex max-w-2xl flex-col gap-3`}>
                    {faqs.map(faq => (
                        <FaqItem key={faq.question} question={faq.question} answer={faq.answer}/>
                    ))}
                </div>
            </section>
        </LandingLayout>
    );
};
