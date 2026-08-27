import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
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

    const activeNest = nests.length ? (nests.find(nest => nest.id === activeNestId) ?? nests[0]) : null;
    const totalEggs = nests.reduce((sum, nest) => sum + nest.eggs.length, 0);

    return (
        <div ref={ref} css={tw`relative`}>
            <button
                type={'button'}
                onClick={() => setOpen(o => !o)}
                css={[
                    tw`inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none`,
                    open && tw`bg-neutral-100 text-neutral-900`,
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
                    css={tw`absolute left-1/2 top-full z-50 mt-2.5 w-[680px] max-w-[90vw] -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl`}
                >
                    {/* Header */}
                    <div css={tw`mb-4 flex items-start justify-between gap-3.5 border-b border-neutral-100 pb-3.5`}>
                        <div>
                            <strong css={tw`block text-[15px] font-bold text-neutral-900`}>Serveurs de jeux</strong>
                            <span css={tw`mt-1 block text-[12.5px] text-neutral-500`}>
                                Des offres pensées par jeu, avec un serveur en ligne en quelques minutes.
                            </span>
                        </div>
                        <span css={tw`flex-shrink-0 whitespace-nowrap rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-600`}>
                            Anti-DDoS inclus
                        </span>
                    </div>

                    {!activeNest ? (
                        <p css={tw`py-6 text-center text-sm italic text-neutral-400`}>
                            Aucun jeu disponible pour le moment.
                        </p>
                    ) : (
                        <>
                            <div css={tw`grid grid-cols-[170px,1fr] gap-0`}>
                                {/* Nests */}
                                <div css={tw`flex flex-col gap-0.5 border-r border-neutral-100 pr-3.5`}>
                                    {nests.map(nest => (
                                        <button
                                            key={nest.id}
                                            type={'button'}
                                            onMouseEnter={() => setActiveNestId(nest.id)}
                                            onClick={() => setActiveNestId(nest.id)}
                                            css={[
                                                tw`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-left text-[13.5px] font-semibold text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900`,
                                                activeNest.id === nest.id && tw`bg-primary-50 text-primary-700`,
                                            ]}
                                        >
                                            <FontAwesomeIcon icon={nestIcon(nest.name)} css={tw`w-[15px] flex-shrink-0`}/>
                                            <span css={tw`flex-1 truncate`}>{nest.name}</span>
                                            <span
                                                css={[
                                                    tw`min-w-[20px] flex-shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-center text-[11px] font-bold text-neutral-500`,
                                                    activeNest.id === nest.id && tw`bg-primary-100 text-primary-600`,
                                                ]}
                                            >
                                                {nest.eggs.length}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Eggs of the active nest */}
                                <div css={tw`grid grid-cols-2 content-start gap-1.5 pl-4`}>
                                    {activeNest.eggs.length === 0 && (
                                        <span css={tw`col-span-2 py-2 text-sm italic text-neutral-400`}>Aucune offre pour le moment</span>
                                    )}
                                    {activeNest.eggs.map(egg => (
                                        <Link
                                            key={egg.id}
                                            to={'/auth/login'}
                                            css={tw`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-neutral-50`}
                                        >
                                            <span css={tw`grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-lg border border-primary-100 bg-primary-50 text-primary-600`}>
                                                <FontAwesomeIcon icon={faServer} css={tw`text-sm`}/>
                                            </span>
                                            <span css={tw`min-w-0`}>
                                                <strong css={tw`block truncate text-sm font-bold text-neutral-900`}>{egg.name}</strong>
                                                <small css={tw`mt-0.5 block text-xs text-neutral-500`}>Installation automatique</small>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div css={tw`mt-3.5 border-t border-neutral-100 pt-3 text-right text-xs text-neutral-500`}>
                                {totalEggs} offre{totalEggs !== 1 && 's'} disponible{totalEggs !== 1 && 's'}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
