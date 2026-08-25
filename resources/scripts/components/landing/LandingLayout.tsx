import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

interface Props {
    children: React.ReactNode;
}

export default ({ children }: Props) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    return (
        <div css={tw`min-h-screen bg-neutral-900 text-neutral-200 flex flex-col`}>
            <div css={tw`w-full bg-neutral-900 shadow-md`}>
                <div>
                    {/* Logo */}
                    <div>

                    </div>

                    {/* Navigation */}
                    <nav>

                    </nav>

                    <Link to={'/auth/login'}>
                        <Button size={'small'}>Se connecter</Button>
                    </Link>
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
