import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBoxOpen,
    faCheck,
    faChevronDown,
    faCloudUploadAlt,
    faGamepad,
    faHeadset,
    faLayerGroup,
    faServer,
    faShieldAlt,
    faSlidersH,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const stats: { value: string; label: string }[] = [
    { value: '~2 min', label: 'Du paiement au serveur qui tourne' },
    { value: '100%', label: 'Stockage NVMe sur toutes les offres' },
    { value: '24/7', label: 'Anti-DDoS actif, sans surcoût' },
];

const features: { icon: IconDefinition; title: string; description: string }[] = [
    {
        icon: faShieldAlt,
        title: 'Anti-DDoS inclus',
        description: 'Une protection réseau active en permanence pour garder votre serveur joignable, sans option payante à activer.',
    },
    {
        icon: faLayerGroup,
        title: 'Ressources dédiées',
        description: 'CPU, RAM et disque garantis pour votre service : ce que vous payez est ce que vous obtenez.',
    },
    {
        icon: faServer,
        title: 'Panel complet',
        description: 'Console, fichiers, sauvegardes, bases de données et redémarrage : vous gardez la main à tout moment.',
    },
    {
        icon: faSlidersH,
        title: 'Versions à la carte',
        description: 'Choisissez le logiciel et la version exacte à la commande, la configuration part automatiquement.',
    },
    {
        icon: faCloudUploadAlt,
        title: 'Sauvegardes incluses',
        description: 'Des points de restauration pour repartir vite après une fausse manipulation.',
    },
    {
        icon: faHeadset,
        title: 'Support réactif',
        description: 'Une équipe qui connaît vos jeux et vos logiciels, joignable par ticket depuis votre espace client.',
    },
];

const steps: { title: string; description: string }[] = [
    { title: 'Choisissez votre offre', description: 'Comparez les ressources et sélectionnez la gamme adaptée à votre projet.' },
    { title: 'Configurez en un écran', description: 'Nom du serveur, logiciel, version : tout se règle avant le paiement.' },
    { title: 'Le serveur se crée seul', description: 'Allocation des ressources, installation et démarrage sont automatiques.' },
    { title: 'Connectez-vous et jouez', description: 'Vous recevez l’accès au panel, plus qu’à inviter votre communauté.' },
];

const faqs: { question: string; answer: string }[] = [
    {
        question: 'Mon serveur est-il vraiment créé automatiquement ?',
        answer: 'Oui. Dès le paiement confirmé, la plateforme réserve les ressources, installe le logiciel choisi et démarre le serveur automatiquement.',
    },
    {
        question: 'Puis-je changer de version ou de logiciel ?',
        answer: 'Vous choisissez le logiciel et la version exacte à la commande, et pouvez en changer ensuite depuis votre espace client.',
    },
    {
        question: 'L’anti-DDoS est-il vraiment inclus ?',
        answer: 'Oui, sur toutes les offres et sans surcoût. Le filtrage réseau reste actif en permanence.',
    },
    {
        question: 'Comment fonctionne le paiement ?',
        answer: 'Les services sont facturés au mois. Vous retrouvez vos échéances et factures directement dans votre espace client.',
    },
    {
        question: 'Et si j’ai besoin d’aide ?',
        answer: 'Ouvrez un ticket depuis votre espace client : notre support connaît vos jeux et vos logiciels.',
    },
];

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
    const [ open, setOpen ] = useState(false);

    return (
        <div css={tw`overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm`}>
            <button
                type={'button'}
                onClick={() => setOpen(o => !o)}
                css={tw`flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold text-neutral-900`}
            >
                {question}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    css={[
                        tw`flex-shrink-0 text-sm text-primary-600 transition-transform duration-200`,
                        open && tw`rotate-180`,
                    ]}
                />
            </button>
            {open && (
                <p css={tw`px-6 pb-5 text-sm leading-relaxed text-neutral-500`}>{answer}</p>
            )}
        </div>
    );
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const accountLink = useStoreState((state: ApplicationStore) => (state.user.data ? '/account' : '/auth/login'));
    const categories = useStoreState((state: ApplicationStore) => state.settings.data?.categories ?? []);
    const nests = categories.flatMap(category => category.nests);

    return (
        <LandingLayout>
            {/* Hero */}
            <section css={tw`mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr,0.95fr] lg:px-8 lg:pt-24`}>
                <div>
                    <span css={tw`inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-neutral-700`}>
                        <span css={tw`h-1.5 w-1.5 rounded-full bg-green-500`}/>
                        Serveurs livrés automatiquement
                    </span>
                    <h1 css={tw`mt-5 font-vitrine-display text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.4rem]`}>
                        Ton serveur <span css={tw`text-primary-600`}>{name}</span>, en ligne en quelques minutes.
                    </h1>
                    <p css={tw`mt-5 max-w-xl text-base leading-relaxed text-neutral-500 sm:text-lg`}>
                        Choisis une offre, paie, et ton service est provisionné automatiquement. Gestion des
                        factures, du support et des ressources depuis un espace client pensé pour être simple.
                    </p>
                    <div css={tw`mt-8 flex flex-wrap gap-3`}>
                        <a
                            href={'#tarifs'}
                            css={tw`inline-flex h-12 items-center justify-center rounded-full bg-primary-600 px-6 text-sm font-bold text-white shadow-lg transition-colors duration-150 hover:bg-primary-700`}
                        >
                            Voir les offres
                        </a>
                        <Link
                            to={accountLink}
                            css={tw`inline-flex h-12 items-center justify-center rounded-full border border-neutral-200 bg-white px-6 text-sm font-bold text-neutral-900 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50`}
                        >
                            Espace client
                        </Link>
                    </div>
                    <ul css={tw`mt-7 flex flex-wrap gap-x-6 gap-y-3`}>
                        {[ 'Panel de gestion inclus', 'Paiement sécurisé', 'Support par ticket' ].map(item => (
                            <li key={item} css={tw`flex items-center gap-2 text-sm font-semibold text-neutral-700`}>
                                <span css={tw`flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-500`}>
                                    <FontAwesomeIcon icon={faCheck} css={tw`text-[9px] text-white`}/>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div css={tw`w-full max-w-[400px] justify-self-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl lg:justify-self-end`}>
                    <div css={tw`px-6 pb-2 pt-6`}>
                        <strong css={tw`block text-[17px] font-extrabold text-neutral-900`}>Ce qui est inclus</strong>
                        <span css={tw`mt-1 block text-[13px] text-neutral-500`}>Sur toutes les offres, sans supplément caché.</span>
                    </div>
                    <ul css={tw`grid grid-cols-2 gap-2.5 px-4 pb-6 pt-4`}>
                        {[
                            { icon: faBoxOpen, title: 'NVMe', subtitle: 'Stockage rapide' },
                            { icon: faShieldAlt, title: 'Anti-DDoS', subtitle: 'Protection réseau' },
                            { icon: faServer, title: 'Auto', subtitle: 'Création instantanée' },
                            { icon: faHeadset, title: '24/7', subtitle: 'Support par ticket' },
                        ].map(({ icon, title, subtitle }) => (
                            <li key={title} css={tw`flex items-center gap-2.5 rounded-xl bg-neutral-50 p-3`}>
                                <span css={tw`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600`}>
                                    <FontAwesomeIcon icon={icon} css={tw`text-sm`}/>
                                </span>
                                <span css={tw`flex min-w-0 flex-col`}>
                                    <b css={tw`truncate text-[13.5px] font-bold text-neutral-900`}>{title}</b>
                                    <span css={tw`truncate text-[11.5px] text-neutral-500`}>{subtitle}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Stats band */}
            <section css={tw`mx-auto flex max-w-7xl flex-wrap gap-x-14 gap-y-6 px-6 pb-16 lg:px-8`}>
                {stats.map(stat => (
                    <div key={stat.label}>
                        <b css={tw`block font-vitrine-display text-3xl font-bold text-neutral-900`}>{stat.value}</b>
                        <span css={tw`mt-1 block max-w-[190px] text-sm leading-snug text-neutral-500`}>{stat.label}</span>
                    </div>
                ))}
            </section>

            {/* Services / pricing */}
            <section id={'tarifs'} css={[ tw`bg-white px-6 py-20 lg:px-8`, { scrollMarginTop: '6rem' } ]}>
                <div css={tw`mx-auto max-w-2xl text-center`}>
                    <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Nos gammes</span>
                    <h2 css={tw`mt-3 font-vitrine-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl`}>
                        Choisissez votre terrain de jeu.
                    </h2>
                    <p css={tw`mt-3 text-neutral-500`}>
                        Des offres pensées par usage, avec les ressources affichées clairement et un prix sans surprise.
                    </p>
                </div>

                <div css={tw`mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
                    {nests.length === 0 && (
                        <p css={tw`col-span-full text-center text-sm text-neutral-400`}>
                            Les offres seront affichées ici dès qu&apos;un jeu sera configuré.
                        </p>
                    )}
                    {nests.map((nest, index) => (
                        <Link
                            key={nest.id}
                            to={`/jeu/${nest.id}`}
                            css={tw`relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg`}
                        >
                            <span css={tw`font-mono text-xs font-semibold text-neutral-400`}>
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div css={tw`mt-3 grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary-600`}>
                                <FontAwesomeIcon icon={faGamepad}/>
                            </div>
                            <h3 css={tw`mt-4 text-xl font-bold text-neutral-900`}>{nest.name}</h3>
                            <p css={tw`mt-2 text-sm leading-relaxed text-neutral-500`}>
                                {nest.fromPrice
                                    ? `Dès ${Number(nest.fromPrice).toFixed(2).replace('.', ',')} €/mois, installation automatique.`
                                    : 'Installation automatique.'}
                            </p>
                            <b css={tw`mt-4 block text-primary-600`}>Voir les offres</b>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Included everywhere */}
            <section css={tw`px-6 py-20 lg:px-8`}>
                <div css={tw`mx-auto max-w-2xl text-center`}>
                    <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Inclus partout</span>
                    <h2 css={tw`mt-3 font-vitrine-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl`}>
                        Tout ce qu&apos;il faut pour gérer sérieusement.
                    </h2>
                    <p css={tw`mt-3 text-neutral-500`}>
                        Pas d&apos;option cachée derrière chaque clic : les bases d&apos;un hébergement fiable sont incluses dès la première offre.
                    </p>
                </div>

                <div css={tw`mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
                    {features.map(({ icon, title, description }) => (
                        <div key={title} css={tw`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg`}>
                            <div css={tw`grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600`}>
                                <FontAwesomeIcon icon={icon}/>
                            </div>
                            <h3 css={tw`mt-4 font-vitrine-display text-lg font-semibold text-neutral-900`}>{title}</h3>
                            <p css={tw`mt-2 text-sm leading-relaxed text-neutral-500`}>{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section css={tw`bg-white px-6 py-20 lg:px-8`}>
                <div css={tw`mx-auto max-w-2xl`}>
                    <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Comment ça marche</span>
                    <h2 css={tw`mt-3 font-vitrine-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl`}>
                        De la commande au jeu, sans attendre.
                    </h2>
                </div>

                <div css={tw`mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4`}>
                    {steps.map((step, index) => (
                        <div key={step.title} css={tw`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm`}>
                            <div css={tw`grid h-9 w-9 place-items-center rounded-lg bg-primary-600 font-vitrine-display text-sm font-extrabold text-white`}>
                                {String(index + 1).padStart(2, '0')}
                            </div>
                            <h3 css={tw`mt-4 text-[15px] font-bold text-neutral-900`}>{step.title}</h3>
                            <p css={tw`mt-2 text-sm leading-relaxed text-neutral-500`}>{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section id={'faq'} css={[ tw`px-6 py-20 lg:px-8`, { scrollMarginTop: '6rem' } ]}>
                <div css={tw`mx-auto max-w-2xl text-center`}>
                    <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-600`}>Questions fréquentes</span>
                    <h2 css={tw`mt-3 font-vitrine-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl`}>
                        Ce qu&apos;on nous demande souvent.
                    </h2>
                </div>

                <div css={tw`mx-auto mt-10 flex max-w-2xl flex-col gap-3`}>
                    {faqs.map(faq => (
                        <FaqItem key={faq.question} question={faq.question} answer={faq.answer}/>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section css={tw`px-6 pb-24 lg:px-8`}>
                <div css={tw`mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-cyan-400 px-8 py-14 text-center shadow-xl`}>
                    <span css={tw`text-xs font-extrabold uppercase tracking-widest text-primary-100`}>Prêt à lancer ?</span>
                    <h2 css={tw`mt-3 font-vitrine-display text-3xl font-bold tracking-tight text-white sm:text-4xl`}>
                        Votre prochain serveur vous attend.
                    </h2>
                    <p css={tw`mx-auto mt-3 max-w-xl text-primary-50`}>
                        Choisissez une gamme, configurez en quelques clics, et laissez {name} s&apos;occuper du reste.
                    </p>
                    <div css={tw`mt-8 flex flex-wrap justify-center gap-3`}>
                        <a
                            href={'#tarifs'}
                            css={tw`inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-primary-600 transition-colors duration-150 hover:bg-primary-50`}
                        >
                            Voir les offres
                        </a>
                        <Link
                            to={accountLink}
                            css={tw`inline-flex h-12 items-center justify-center rounded-full border border-white/50 px-6 text-sm font-bold text-white transition-colors duration-150 hover:bg-white/10`}
                        >
                            Espace client
                        </Link>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};
