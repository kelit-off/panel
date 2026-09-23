import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCog, faShieldAlt, faSignOutAlt, faStore } from '@fortawesome/free-solid-svg-icons';
import http from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';

const links = [
    { to: '/account', label: 'Tableau de bord', exact: true },
    { to: '/account/services', label: 'Mes services' },
    { to: '/account/billing', label: 'Factures' },
    { to: '/account/tickets', label: 'Support' },
];

const NavItem = ({ to, label, exact }: { to: string; label: string; exact?: boolean }) => {
    const { pathname } = useLocation();
    const active = exact ? pathname === to : pathname.startsWith(to);

    return (
        <Link
            to={to}
            css={[
                tw`inline-flex h-10 items-center whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-colors duration-150`,
                active ? tw`bg-primary-50 text-primary-700` : tw`text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900`,
            ]}
        >
            {label}
        </Link>
    );
};

const UserMenu = () => {
    const user = useStoreState((state: ApplicationStore) => state.user.data!);
    const [ open, setOpen ] = useState(false);

    const logout = () => {
        http.post('/auth/logout').finally(() => {
            // @ts-ignore
            window.location = '/';
        });
    };

    const itemStyle = tw`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-50`;

    return (
        <div css={tw`relative`}>
            <button
                type={'button'}
                onClick={() => setOpen(o => !o)}
                css={tw`flex h-10 items-center gap-2.5 rounded-lg border border-neutral-200 bg-white pl-1.5 pr-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50`}
            >
                <span css={tw`flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-xs font-bold uppercase text-white`}>
                    {user.username.charAt(0)}
                </span>
                <span css={tw`hidden max-w-[8rem] truncate sm:block`}>{user.username}</span>
                <FontAwesomeIcon icon={faChevronDown} css={tw`text-[10px] text-neutral-400`}/>
            </button>
            {open && (
                <>
                    <div css={tw`fixed inset-0 z-40`} onClick={() => setOpen(false)}/>
                    <div css={tw`absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg`}>
                        <div css={tw`border-b border-neutral-100 px-4 py-3`}>
                            <p css={tw`truncate text-sm font-bold text-neutral-900`}>{user.username}</p>
                            <p css={tw`truncate text-xs text-neutral-500`}>{user.email}</p>
                        </div>
                        <Link to={'/account/settings'} css={itemStyle} onClick={() => setOpen(false)}>
                            <FontAwesomeIcon icon={faCog} css={tw`w-4 text-neutral-400`}/> Paramètres du compte
                        </Link>
                        <Link to={'/'} css={itemStyle} onClick={() => setOpen(false)}>
                            <FontAwesomeIcon icon={faStore} css={tw`w-4 text-neutral-400`}/> Boutique
                        </Link>
                        {user.rootAdmin && (
                            <a href={'/admin'} css={itemStyle}>
                                <FontAwesomeIcon icon={faShieldAlt} css={tw`w-4 text-neutral-400`}/> Administration
                            </a>
                        )}
                        <button type={'button'} onClick={logout} css={[ itemStyle, tw`border-t border-neutral-100 text-red-600` ]}>
                            <FontAwesomeIcon icon={faSignOutAlt} css={tw`w-4`}/> Déconnexion
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ({ children }: { children: React.ReactNode }) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    return (
        <div css={tw`flex min-h-screen flex-col bg-[#f6f8fb] font-vitrine text-neutral-900`}>
            <header css={tw`sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur`}>
                <div css={tw`mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8`}>
                    <Link to={'/account'} css={tw`flex flex-shrink-0 items-center gap-2.5`}>
                        <img src={'/favicons/favicon.svg'} alt={''} css={tw`h-8 w-8 flex-shrink-0`}/>
                        <span css={tw`font-vitrine-display text-lg font-bold tracking-tight`}>{name}</span>
                    </Link>
                    <nav css={tw`hidden items-center gap-1 md:flex`}>
                        {links.map(link => <NavItem key={link.to} {...link}/>)}
                    </nav>
                    <UserMenu/>
                </div>
                <nav css={tw`flex gap-1 overflow-x-auto border-t border-neutral-100 px-4 py-2 md:hidden`}>
                    {links.map(link => <NavItem key={link.to} {...link}/>)}
                </nav>
            </header>

            <main css={tw`mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8`}>
                <FlashMessageRender byKey={'account'} css={tw`mb-6`}/>
                {children}
            </main>

            <footer css={tw`border-t border-neutral-200 bg-white px-6 py-5 text-center text-xs text-neutral-400`}>
                &copy; {(new Date()).getFullYear()} {name}. Tous droits réservés.
            </footer>
        </div>
    );
};
