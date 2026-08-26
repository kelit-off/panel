import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import GamesDropdown from '@/components/landing/GamesDropdown';

interface Props {
    children: React.ReactNode;
}

export default ({ children }: Props) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div css={tw`min-h-screen bg-neutral-900 text-neutral-200 flex flex-col`}>
            <div css={tw`h-0.5 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600`}/>

            <div css={tw`sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-900/80 backdrop-blur`}>
                <div css={tw`mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8`}>
                    {/* Logo + nav */}
                    <div css={tw`flex items-center gap-8`}>
                        <Link to={'/'} css={tw`flex items-center gap-2 flex-shrink-0`}>
                            <div css={tw`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg`}>
                                <div css={tw`h-2 w-2 rounded-full bg-white`}/>
                            </div>
                            <span css={tw`text-lg font-bold tracking-tight text-neutral-50`}>{name}</span>
                        </Link>

                        <nav css={tw`hidden items-center gap-6 sm:flex`}>
                            <Link
                                to={'/'}
                                css={[
                                    tw`text-sm font-medium text-neutral-400 transition-colors duration-150 hover:text-neutral-100`,
                                    isHome && tw`text-purple-400 hover:text-purple-400`,
                                ]}
                            >
                                Accueil
                            </Link>
                            <GamesDropdown/>
                            <Link
                                to={'/'}
                                css={tw`text-sm font-medium text-neutral-400 transition-colors duration-150 hover:text-neutral-100`}
                            >
                                Tarifs
                            </Link>
                            <Link
                                to={'/'}
                                css={tw`text-sm font-medium text-neutral-400 transition-colors duration-150 hover:text-neutral-100`}
                            >
                                Statut
                            </Link>
                        </nav>
                    </div>

                    {/* Actions */}
                    <div css={tw`flex items-center gap-3`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`hidden rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors duration-150 hover:border-neutral-500 hover:bg-neutral-800/60 sm:inline-flex`}
                        >
                            Console
                        </Link>
                        <Link
                            to={'/auth/login'}
                            css={tw`inline-flex items-center rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-150 hover:from-purple-500 hover:to-indigo-500`}
                        >
                            Commencer
                        </Link>
                    </div>
                </div>
            </div>

            <div css={tw`flex-1`}>
                {children}
            </div>

            <div css={tw`w-full border-t border-neutral-800`}>
                <p css={tw`mx-auto max-w-6xl px-4 py-6 text-center text-xs text-neutral-500`}>
                    &copy; {(new Date()).getFullYear()} {name}. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};
