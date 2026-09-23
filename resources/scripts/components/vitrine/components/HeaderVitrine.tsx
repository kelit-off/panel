import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import GamesDropdown from '@/components/vitrine/components/GamesDropdown';

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const accountLink = useStoreState((state: ApplicationStore) => (state.user.data ? '/account' : '/auth/login'));

    return (
        <div css={tw`sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 font-vitrine backdrop-blur`}>
            <div css={tw`mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8`}>
                <Link to={'/'} css={tw`flex flex-shrink-0 items-center gap-2.5`}>
                    <img src={'/favicons/favicon.svg'} alt={''} css={tw`h-8 w-8 flex-shrink-0`}/>
                    <span css={tw`font-vitrine-display text-lg font-bold tracking-tight text-neutral-900`}>{name}</span>
                </Link>

                <nav css={tw`hidden items-center gap-1 sm:flex`}>
                    <Link
                        to={'/'}
                        css={tw`inline-flex h-10 items-center rounded-lg px-3.5 text-sm font-semibold text-neutral-900 transition-colors duration-150 hover:bg-neutral-100`}
                    >
                        Accueil
                    </Link>
                    <GamesDropdown/>
                    <Link
                        to={'/outils/calculateur-ram-minecraft'}
                        css={tw`inline-flex h-10 items-center rounded-lg px-3.5 text-sm font-semibold text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900`}
                    >
                        Calculateur de RAM
                    </Link>
                </nav>

                <div css={tw`flex items-center gap-2.5`}>
                    <a
                        href={'#'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        aria-label={'Rejoindre le Discord'}
                        css={tw`hidden h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors duration-150 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 sm:inline-flex`}
                    >
                        <FontAwesomeIcon icon={faDiscord}/>
                    </a>
                    <Link
                        to={accountLink}
                        css={tw`inline-flex h-10 items-center rounded-lg bg-primary-600 px-4 text-sm font-bold text-white shadow-lg transition-colors duration-150 hover:bg-primary-700`}
                    >
                        Espace client
                    </Link>
                </div>
            </div>
        </div>
    );
};
