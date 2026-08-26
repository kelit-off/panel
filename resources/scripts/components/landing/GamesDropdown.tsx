import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronRight,
    faCrosshairs,
    faCube,
    faGamepad,
    faIndustry,
    faMicrophone,
    faPaw,
    faServer,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Best-effort icon based on the nest name so common categories feel less generic;
// falls back to a plain gamepad icon for anything that isn't recognised.
const nestIcon = (name: string): IconDefinition => {
    const value = name.toLowerCase();

    if (value.includes('minecraft')) return faCube;
    if (value.includes('voice')) return faMicrophone;
    if (value.includes('rust')) return faIndustry;
    if (value.includes('source') || value.includes('fps')) return faCrosshairs;
    if (value.includes('ark')) return faPaw;

    return faGamepad;
};

export default () => {
    const nests = useStoreState((state: ApplicationStore) => state.settings.data?.nests ?? []);
    const [ open, setOpen ] = useState(false);
    const [ activeNestId, setActiveNestId ] = useState<number | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const escListener = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('keydown', escListener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('keydown', escListener);
        };
    }, []);

    if (!nests.length) {
        return null;
    }

    const activeNest = nests.find(nest => nest.id === activeNestId) ?? nests[0];

    return (
        <div ref={ref} css={tw`relative`}>
            <button
                type={'button'}
                onClick={() => setOpen(o => !o)}
                css={[
                    tw`flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors duration-150 focus:outline-none`,
                    open && tw`text-neutral-100`,
                ]}
            >
                Jeux
                <FontAwesomeIcon
                    icon={faChevronDown}
                    css={[
                        tw`text-2xs transition-transform duration-150`,
                        open && tw`transform rotate-180`,
                    ]}
                />
            </button>

            {open && (
                <div
                    css={tw`absolute left-1/2 top-full z-50 mt-3 flex w-[640px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur`}
                >
                    {/* Games */}
                    <div css={tw`w-56 flex-shrink-0 border-r border-neutral-800 p-2`}>
                        <ul css={tw`max-h-96 space-y-0.5 overflow-y-auto`}>
                            {nests.map(nest => (
                                <li key={nest.id}>
                                    <button
                                        type={'button'}
                                        onMouseEnter={() => setActiveNestId(nest.id)}
                                        onClick={() => setActiveNestId(nest.id)}
                                        css={[
                                            tw`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-neutral-300 transition-colors duration-150 hover:bg-neutral-800 hover:text-white`,
                                            activeNest.id === nest.id && tw`bg-neutral-800 text-white`,
                                        ]}
                                    >
                                        <FontAwesomeIcon icon={nestIcon(nest.name)} css={tw`w-4 text-purple-400`}/>
                                        <span css={tw`flex-1 truncate`}>{nest.name}</span>
                                        <FontAwesomeIcon icon={faChevronRight} css={tw`text-2xs text-neutral-600`}/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Versions / variants for the active game */}
                    <div css={tw`flex-1 p-4`}>
                        <div css={tw`text-2xs font-semibold uppercase tracking-wider text-purple-400`}>
                            {activeNest.name}
                        </div>
                        <ul css={tw`mt-2 grid max-h-80 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2`}>
                            {activeNest.eggs.length === 0 && (
                                <li css={tw`text-sm text-neutral-600 italic`}>Aucun jeu pour le moment</li>
                            )}
                            {activeNest.eggs.map(egg => (
                                <li key={egg.id}>
                                    <Link
                                        to={'/auth/login'}
                                        css={tw`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 transition-colors duration-150 hover:bg-neutral-800 hover:text-white`}
                                    >
                                        <FontAwesomeIcon icon={faServer} css={tw`text-xs text-neutral-600`}/>
                                        <span css={tw`truncate`}>{egg.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
