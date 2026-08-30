import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw, { TwStyle } from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar,
    faChevronDown,
    faCrosshairs,
    faCube,
    faGamepad,
    faIndustry,
    faMicrophone,
    faMountain,
    faPaw,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Best-effort icon based on the nest name so common categories feel less generic;
// falls back to a plain gamepad icon for anything that isn't recognised.
const nestIcon = (name: string): IconDefinition => {
    const value = name.toLowerCase();

    if (value.includes('minecraft')) return faCube;
    if (value.includes('voice') || value.includes('teamspeak') || value.includes('mumble')) return faMicrophone;
    if (value.includes('rust')) return faIndustry;
    if (value.includes('source') || value.includes('fps') || value.includes('csgo')) return faCrosshairs;
    if (value.includes('ark')) return faPaw;
    if (value.includes('roleplay') || value.includes(' rp')) return faUsers;
    if (value.includes('survie') || value.includes('survival')) return faMountain;

    return faGamepad;
};

// Limited to colours this project's Tailwind config actually exposes
// (no emerald/amber/rose here — just the legacy blue/purple/green/yellow/pink/cyan palette).
const ACCENT_KEYS = [ 'blue', 'purple', 'green', 'yellow', 'pink', 'cyan' ] as const;
type AccentKey = typeof ACCENT_KEYS[number];

const accentStyles: Record<AccentKey, {
    iconText: TwStyle;
    avatarBg: TwStyle;
    hover: TwStyle;
}> = {
    blue: { iconText: tw`text-blue-500`, avatarBg: tw`bg-blue-500`, hover: tw`hover:bg-blue-50/60` },
    purple: { iconText: tw`text-purple-500`, avatarBg: tw`bg-purple-500`, hover: tw`hover:bg-purple-50/60` },
    green: { iconText: tw`text-green-500`, avatarBg: tw`bg-green-500`, hover: tw`hover:bg-green-50/60` },
    yellow: { iconText: tw`text-yellow-500`, avatarBg: tw`bg-yellow-500`, hover: tw`hover:bg-yellow-50/60` },
    pink: { iconText: tw`text-pink-500`, avatarBg: tw`bg-pink-500`, hover: tw`hover:bg-pink-50/60` },
    cyan: { iconText: tw`text-cyan-500`, avatarBg: tw`bg-cyan-500`, hover: tw`hover:bg-cyan-50/60` },
};

// Recognised game servers get a matching brand-ish icon shown in colour with no
// background; anything else falls back to a coloured letter avatar, the colour
// picked deterministically from the name so a given game keeps its colour.
const eggVisual = (name: string): { icon?: IconDefinition; letter?: string; accent: AccentKey } => {
    const value = name.toLowerCase();

    if (value.includes('fivem')) return { icon: faCar, accent: 'blue' };
    if (value.includes('minecraft')) return { icon: faCube, accent: 'green' };
    if (value.includes('rust')) return { icon: faIndustry, accent: 'yellow' };
    if (value.includes('ark')) return { icon: faPaw, accent: 'cyan' };
    if (value.includes('source') || value.includes('csgo') || value.includes('counter')) return { icon: faCrosshairs, accent: 'pink' };
    if (value.includes('teamspeak') || value.includes('mumble') || value.includes('voice')) return { icon: faMicrophone, accent: 'purple' };

    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return { letter: name.trim().charAt(0).toUpperCase(), accent: ACCENT_KEYS[hash % ACCENT_KEYS.length] };
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
                                Hébergez vos jeux préférés avec une performance optimale.
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
                            <div css={tw`flex flex-row gap-0`}>
                                {/* Nests */}
                                <div css={tw`flex w-[170px] flex-shrink-0 flex-col gap-0.5 border-r border-neutral-100 pr-3.5`}>
                                    {nests.map(nest => {
                                        const isActive = activeNest.id === nest.id;

                                        return (
                                            <button
                                                key={nest.id}
                                                type={'button'}
                                                onMouseEnter={() => setActiveNestId(nest.id)}
                                                onClick={() => setActiveNestId(nest.id)}
                                                css={[
                                                    tw`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900`,
                                                    isActive && tw`bg-primary-50 text-neutral-900`,
                                                ]}
                                            >
                                                <FontAwesomeIcon
                                                    icon={nestIcon(nest.name)}
                                                    css={[ tw`w-[15px] flex-shrink-0 text-neutral-400`, isActive && tw`text-primary-600` ]}
                                                />
                                                <span css={tw`flex-1 truncate`}>{nest.name}</span>
                                                <span
                                                    css={[
                                                        tw`min-w-[22px] flex-shrink-0 rounded-md bg-neutral-100 px-1.5 py-0.5 text-center text-[11px] font-bold text-neutral-500`,
                                                        isActive && tw`bg-white`,
                                                    ]}
                                                >
                                                    {nest.eggs.length}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Eggs of the active nest */}
                                <div css={tw`grid flex-1 grid-cols-2 content-start gap-1.5 pl-4`}>
                                    {activeNest.eggs.length === 0 && (
                                        <span css={tw`col-span-2 py-2 text-sm italic text-neutral-400`}>Aucune offre pour le moment</span>
                                    )}
                                    {activeNest.eggs.map(egg => {
                                        const visual = eggVisual(egg.name);
                                        const accent = accentStyles[visual.accent];

                                        return (
                                            <Link
                                                key={egg.id}
                                                to={'/auth/login'}
                                                css={[
                                                    tw`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150`,
                                                    accent.hover,
                                                ]}
                                            >
                                                {visual.icon ? (
                                                    <span css={[ tw`grid h-9 w-9 flex-shrink-0 place-items-center text-lg`, accent.iconText ]}>
                                                        <FontAwesomeIcon icon={visual.icon}/>
                                                    </span>
                                                ) : (
                                                    <span css={[ tw`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-sm font-bold text-white`, accent.avatarBg ]}>
                                                        {visual.letter}
                                                    </span>
                                                )}
                                                <span css={tw`min-w-0`}>
                                                    <strong css={tw`block truncate text-sm font-bold text-neutral-900`}>{egg.name}</strong>
                                                    <small css={tw`mt-0.5 block text-xs text-neutral-500`}>Installation automatique</small>
                                                </span>
                                            </Link>
                                        );
                                    })}
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
