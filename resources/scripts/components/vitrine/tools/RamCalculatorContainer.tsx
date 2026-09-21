import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import LandingLayout from '@/components/vitrine/landing/LandingLayout';
import FaqItem from '@/components/vitrine/components/FaqItem';
import useDocumentTitle from '@/plugins/useDocumentTitle';
import {
    getRamEstimate,
    getRamGuide,
    RamEstimate,
    RamGuide,
    RamLoader,
    RamParams,
    RamPlan,
    RamWeight,
} from '@/api/vitrine/ramTool';

const loaders: { value: RamLoader; label: string }[] = [
    { value: 'vanilla', label: 'Vanilla' },
    { value: 'paper', label: 'Paper / Spigot' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'forge', label: 'Forge / NeoForge' },
];

const weights: { value: RamWeight; label: string; hint: string }[] = [
    { value: 'light', label: 'Léger', hint: 'Optimisation, confort' },
    { value: 'standard', label: 'Standard', hint: 'Exploration, magie' },
    { value: 'heavy', label: 'Technique', hint: 'Usines, monde lourd' },
];

const inputLabel = tw`block text-sm font-semibold text-neutral-900`;

function Segmented<T extends string> ({ label, value, options, onChange }: {
    label: string;
    value: T;
    options: { value: T; label: string; hint?: string }[];
    onChange: (value: T) => void;
}) {
    return (
        <div>
            <span id={`seg-${label}`} css={inputLabel}>{label}</span>
            <div role={'radiogroup'} aria-labelledby={`seg-${label}`} css={tw`mt-2 flex flex-wrap gap-2`}>
                {options.map(option => (
                    <button
                        key={option.value}
                        type={'button'}
                        role={'radio'}
                        aria-checked={value === option.value}
                        onClick={() => onChange(option.value)}
                        css={[
                            tw`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors duration-150`,
                            value === option.value
                                ? tw`border-primary-600 bg-primary-50 text-primary-700`
                                : tw`border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300`,
                        ]}
                    >
                        {option.label}
                        {option.hint && <span css={tw`block text-xs font-normal text-neutral-500`}>{option.hint}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

const NumberField = ({ id, label, value, min, max, sliderMax, onChange }: {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    sliderMax?: number;
    onChange: (value: number) => void;
}) => {
    const clamp = (raw: number) => Math.min(max, Math.max(min, Number.isNaN(raw) ? min : Math.round(raw)));

    return (
        <div>
            <label htmlFor={id} css={inputLabel}>{label}</label>
            <div css={tw`mt-2 flex items-center gap-4`}>
                <input
                    id={id}
                    type={'range'}
                    min={min}
                    max={sliderMax ?? max}
                    value={Math.min(value, sliderMax ?? max)}
                    onChange={e => onChange(clamp(Number(e.currentTarget.value)))}
                    css={tw`h-2 flex-1 cursor-pointer`}
                    style={{ accentColor: '#2563eb' } as React.CSSProperties}
                />
                <input
                    type={'number'}
                    aria-label={label}
                    min={min}
                    max={max}
                    value={value}
                    onChange={e => onChange(clamp(Number(e.currentTarget.value)))}
                    css={tw`w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-right text-sm font-semibold text-neutral-900`}
                />
            </div>
        </div>
    );
};

const PlanLine = ({ heading, plan }: { heading: string; plan: RamPlan }) => (
    <div css={tw`flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3`}>
        <div>
            <p css={tw`text-xs font-semibold text-neutral-500`}>{heading}</p>
            <p css={tw`text-sm font-bold text-neutral-900`}>{plan.game} {plan.name}, {plan.ram}</p>
            <p css={tw`text-xs text-neutral-500`}>{plan.priceLabel} par mois</p>
        </div>
        <Link
            to={`/commande/${plan.id}`}
            css={tw`inline-flex h-10 flex-shrink-0 items-center rounded-full bg-primary-600 px-5 text-sm font-bold text-white transition-colors duration-150 hover:bg-primary-700`}
        >
            Commander
        </Link>
    </div>
);

export default () => {
    const siteName = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const [ params, setParams ] = useState<RamParams>({ loader: 'forge', mods: 100, weight: 'standard', players: 10, view: 10 });
    const [ estimate, setEstimate ] = useState<RamEstimate | null>(null);
    const [ guide, setGuide ] = useState<RamGuide | null>(null);
    const [ failed, setFailed ] = useState(false);

    const modded = params.loader === 'fabric' || params.loader === 'forge';
    const hasCount = modded || params.loader === 'paper';
    const set = (patch: Partial<RamParams>) => setParams(current => ({ ...current, ...patch }));

    useDocumentTitle(`Calculateur de RAM pour serveur Minecraft | ${siteName}`);

    useEffect(() => {
        getRamGuide().then(setGuide).catch(() => undefined);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(() => {
            getRamEstimate(params)
                .then(result => {
                    if (!cancelled) {
                        setEstimate(result);
                        setFailed(false);
                    }
                })
                .catch(() => !cancelled && setFailed(true));
        }, 180);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [ params ]);

    const { minimum, recommended } = estimate?.plans ?? { minimum: null, recommended: null };

    return (
        <LandingLayout>
            <section css={tw`mx-auto max-w-6xl px-6 pb-24 pt-10 lg:px-8`}>
                <Link
                    to={'/'}
                    css={tw`inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors duration-150 hover:text-neutral-900`}
                >
                    <FontAwesomeIcon icon={faArrowLeft} css={tw`text-xs`}/>
                    Accueil
                </Link>

                <div css={tw`mt-8 max-w-3xl`}>
                    <h1 css={tw`font-vitrine-display text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl`}>
                        Calculateur de RAM pour serveur Minecraft
                    </h1>
                    {guide && <p css={tw`mt-3 text-neutral-500 sm:text-lg`}>{guide.intro}</p>}
                </div>

                <div css={tw`mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5`}>
                    <div css={tw`space-y-7 rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-3`}>
                        <Segmented label={'Type de serveur'} value={params.loader} options={loaders} onChange={loader => set({ loader })}/>

                        {hasCount && (
                            <NumberField
                                id={'ram-mods'}
                                label={modded ? 'Nombre de mods' : 'Nombre de plugins'}
                                value={params.mods}
                                min={0}
                                max={600}
                                sliderMax={modded ? 400 : 100}
                                onChange={mods => set({ mods })}
                            />
                        )}

                        {modded && (
                            <Segmented label={'Type de modpack'} value={params.weight} options={weights} onChange={weight => set({ weight })}/>
                        )}

                        <NumberField
                            id={'ram-players'}
                            label={'Joueurs connectés en même temps'}
                            value={params.players}
                            min={1}
                            max={500}
                            sliderMax={100}
                            onChange={players => set({ players })}
                        />

                        <NumberField
                            id={'ram-view'}
                            label={'Distance d’affichage (chunks)'}
                            value={params.view}
                            min={2}
                            max={32}
                            sliderMax={24}
                            onChange={view => set({ view })}
                        />
                    </div>

                    <div css={tw`lg:col-span-2`} aria-live={'polite'}>
                        <div css={tw`rounded-2xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-24`}>
                            {failed && !estimate ? (
                                <p css={tw`text-sm text-red-500`}>Le calcul est momentanément indisponible, réessayez dans un instant.</p>
                            ) : !estimate ? (
                                <p css={tw`text-sm text-neutral-400`}>Calcul en cours…</p>
                            ) : (
                                <>
                                    <p css={tw`text-sm font-semibold text-neutral-500`}>RAM recommandée</p>
                                    <p css={tw`mt-1 font-vitrine-display text-5xl font-bold text-neutral-900`}>{estimate.recommendedGb} Go</p>
                                    <p css={tw`mt-1 text-sm text-neutral-500`}>
                                        Minimum viable : {estimate.minimumGb} Go. Besoin estimé : {estimate.estimateGb.toLocaleString('fr-FR')} Go, plus 20 % de marge.
                                    </p>

                                    <dl css={tw`mt-5 border-t border-neutral-100 pt-4 text-sm`}>
                                        {estimate.breakdown.map(row => (
                                            <div key={row.label} css={tw`flex items-baseline justify-between gap-4 py-1`}>
                                                <dt css={tw`text-neutral-500`}>{row.label}</dt>
                                                <dd css={tw`font-semibold text-neutral-900`}>{row.gb.toLocaleString('fr-FR')} Go</dd>
                                            </div>
                                        ))}
                                    </dl>

                                    <div css={tw`mt-5 space-y-3`}>
                                        {recommended ? (
                                            <PlanLine heading={'Offre conseillée'} plan={recommended}/>
                                        ) : (
                                            <p css={tw`rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800`}>
                                                Cette configuration dépasse nos offres actuelles. Ouvrez un ticket depuis votre espace client pour une offre sur mesure.
                                            </p>
                                        )}
                                        {minimum && recommended && minimum.id !== recommended.id && (
                                            <PlanLine heading={'Offre minimale suffisante'} plan={minimum}/>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {guide && (
                    <>
                        <div css={tw`mt-16`}>
                            <h2 css={tw`font-vitrine-display text-2xl font-bold tracking-tight text-neutral-900`}>Exemples de configurations</h2>
                            <div css={tw`mt-5 overflow-x-auto rounded-2xl border border-neutral-200 bg-white`}>
                                <table css={tw`w-full text-left text-sm`}>
                                    <thead>
                                        <tr css={tw`border-b border-neutral-100 text-xs font-semibold text-neutral-500`}>
                                            <th css={tw`px-5 py-3`}>Cas</th>
                                            <th css={tw`px-5 py-3`}>Configuration</th>
                                            <th css={tw`px-5 py-3`}>RAM minimale</th>
                                            <th css={tw`px-5 py-3`}>RAM recommandée</th>
                                            <th css={tw`px-5 py-3`}>Offre conseillée</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {guide.scenarios.map(scenario => (
                                            <tr key={scenario.label} css={tw`border-b border-neutral-100 last:border-0`}>
                                                <td css={tw`px-5 py-3 font-semibold text-neutral-900`}>{scenario.label}</td>
                                                <td css={tw`px-5 py-3 text-neutral-600`}>{scenario.summary}</td>
                                                <td css={tw`px-5 py-3 text-neutral-900`}>{scenario.minimumGb} Go</td>
                                                <td css={tw`px-5 py-3 font-semibold text-neutral-900`}>{scenario.recommendedGb} Go</td>
                                                <td css={tw`px-5 py-3`}>
                                                    {scenario.plan ? (
                                                        <Link to={`/commande/${scenario.plan.id}`} css={tw`font-semibold text-primary-600 hover:text-primary-700`}>
                                                            {scenario.plan.name}
                                                        </Link>
                                                    ) : 'Sur mesure'}
                                                    {scenario.plan && <span css={tw`ml-2 text-neutral-500`}>{scenario.plan.priceLabel} par mois</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div css={tw`mt-16 max-w-3xl`}>
                            <h2 css={tw`font-vitrine-display text-2xl font-bold tracking-tight text-neutral-900`}>Comment l’estimation est calculée</h2>
                            <ul css={tw`mt-5 space-y-3 text-neutral-600`}>
                                {guide.method.map(line => (
                                    <li key={line} css={tw`leading-relaxed`}>{line}</li>
                                ))}
                            </ul>
                            <p css={tw`mt-5 rounded-xl bg-neutral-100 px-4 py-3 text-sm leading-relaxed text-neutral-600`}>{guide.disclaimer}</p>
                        </div>

                        <div css={tw`mt-16 max-w-2xl`}>
                            <h2 css={tw`font-vitrine-display text-2xl font-bold tracking-tight text-neutral-900`}>Questions fréquentes</h2>
                            <div css={tw`mt-5 flex flex-col gap-3`}>
                                {guide.faqs.map(faq => (
                                    <FaqItem key={faq.question} question={faq.question} answer={faq.answer}/>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </section>
        </LandingLayout>
    );
};
