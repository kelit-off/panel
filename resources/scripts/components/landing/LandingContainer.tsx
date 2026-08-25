import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import LandingLayout from '@/components/landing/LandingLayout';
import { faBolt, faLock, faServer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const features = [
    {
        icon: faServer,
        title: 'Gestion simplifiée',
        description: 'Déployez et administrez vos serveurs depuis une interface claire, sans ligne de commande.',
    },
    {
        icon: faBolt,
        title: 'Performances',
        description: 'Une infrastructure pensée pour la rapidité, du démarrage des serveurs à la navigation dans le panel.',
    },
    {
        icon: faLock,
        title: 'Sécurisé',
        description: 'Authentification à deux facteurs, clés de sécurité et permissions fines pour chaque utilisateur.',
    },
];

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    return (
        <LandingLayout>
            <div css={tw`mx-auto max-w-4xl text-center px-4 pt-24 pb-16`}>
                <h1 css={tw`text-4xl sm:text-5xl font-header font-bold text-neutral-50`}>
                    Bienvenue sur {name}
                </h1>
                <p css={tw`mt-6 text-lg text-neutral-400`}>
                    La plateforme d&apos;hébergement de serveurs de jeux et d&apos;applications,
                    simple et rapide.
                </p>
                <div css={tw`mt-10`}>
                    <Link to={'/auth/login'}>
                        <Button size={'large'}>Accéder au panel</Button>
                    </Link>
                </div>
            </div>

            <div css={tw`mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 pb-24`}>
                {features.map(({ icon, title, description }) => (
                    <div key={title} css={tw`bg-neutral-800 rounded-lg p-6 border border-neutral-700`}>
                        <FontAwesomeIcon icon={icon} css={tw`text-primary-400 text-2xl`}/>
                        <h3 css={tw`mt-4 text-lg font-medium text-neutral-100`}>{title}</h3>
                        <p css={tw`mt-2 text-sm text-neutral-400`}>{description}</p>
                    </div>
                ))}
            </div>
        </LandingLayout>
    );
};
