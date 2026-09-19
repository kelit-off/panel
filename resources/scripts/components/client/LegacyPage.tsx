import React from 'react';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { PageTitle } from '@/components/client/ui';

// Wraps the pre-existing panel pages (API keys, SSH keys, security keys) so they
// sit inside the new client area until they get their own redesign.
export default ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <>
        <Link to={'/account/settings'} css={tw`mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900`}>
            <FontAwesomeIcon icon={faChevronLeft} css={tw`text-xs`}/> Paramètres du compte
        </Link>
        <PageTitle title={title} subtitle={subtitle}/>
        <div css={tw`overflow-hidden rounded-2xl bg-neutral-800 px-2 pb-2 shadow-sm sm:px-6`}>
            {children}
        </div>
    </>
);
