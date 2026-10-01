import React, { useState } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faGift, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useReferral } from '@/api/account/referral';
import { Btn, Card, CardTitle, EmptyState, PageTitle, Pill, formatDate } from '@/components/client/ui';

const euros = (amount: number) => `${amount.toFixed(2).replace('.', ',')} €`;

const statuses = {
    pending: { label: 'En attente', tone: 'yellow' as const },
    rewarded: { label: 'Récompense versée', tone: 'green' as const },
    rejected: { label: 'Non éligible', tone: 'neutral' as const },
};

const Step = ({ n, title, text }: { n: number; title: string; text: string }) => (
    <div css={tw`flex gap-4`}>
        <div css={tw`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700`}>{n}</div>
        <div>
            <p css={tw`text-sm font-bold text-neutral-900`}>{title}</p>
            <p css={tw`mt-0.5 text-sm text-neutral-500`}>{text}</p>
        </div>
    </div>
);

export default () => {
    const { data, error } = useReferral();
    const [ copied, setCopied ] = useState(false);

    const copy = () => {
        if (!data) return;

        navigator.clipboard.writeText(data.link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <>
            <PageTitle title={'Parrainage'} subtitle={'Invitez vos amis et gagnez du crédit sur vos prochaines factures.'}/>

            {error ? (
                <Card><p css={tw`text-sm text-neutral-500`}>Impossible de charger votre espace parrainage pour le moment.</p></Card>
            ) : !data ? (
                <Card><p css={tw`text-sm text-neutral-400`}>Chargement…</p></Card>
            ) : !data.enabled ? (
                <Card><p css={tw`text-sm text-neutral-500`}>Le parrainage n&apos;est pas disponible pour le moment.</p></Card>
            ) : (
                <>
                    <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-2`}>
                        <Card>
                            <p css={tw`font-vitrine-display text-2xl font-bold leading-none text-neutral-900`}>{euros(data.credit)}</p>
                            <p css={tw`mt-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400`}>Crédit disponible</p>
                            <p css={tw`mt-2 text-xs text-neutral-500`}>Déduit automatiquement de votre prochaine facture.</p>
                        </Card>
                        <Card>
                            <p css={tw`font-vitrine-display text-2xl font-bold leading-none text-neutral-900`}>{euros(data.totalEarned)}</p>
                            <p css={tw`mt-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400`}>Total gagné</p>
                            <p css={tw`mt-2 text-xs text-neutral-500`}>
                                {data.referrals.filter(r => r.status === 'rewarded').length} parrainage(s) abouti(s).
                            </p>
                        </Card>
                    </div>

                    <div css={tw`mt-6`}>
                        <Card>
                            <CardTitle>Votre lien de parrainage</CardTitle>
                            <div css={tw`flex flex-col gap-3 sm:flex-row`}>
                                <input
                                    readOnly
                                    value={data.link}
                                    onFocus={e => e.currentTarget.select()}
                                    css={tw`h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 text-sm text-neutral-700 outline-none`}
                                />
                                <Btn type={'button'} onClick={copy}>
                                    <FontAwesomeIcon icon={copied ? faCheck : faCopy}/> {copied ? 'Copié' : 'Copier'}
                                </Btn>
                            </div>
                            <p css={tw`mt-3 text-xs text-neutral-500`}>
                                Votre code : <span css={tw`font-bold tracking-widest text-neutral-900`}>{data.code}</span>
                            </p>
                        </Card>
                    </div>

                    <div css={tw`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5`}>
                        <div css={tw`lg:col-span-2`}>
                            <Card>
                                <CardTitle>Comment ça marche</CardTitle>
                                <div css={tw`space-y-5`}>
                                    <Step
                                        n={1}
                                        title={'Partagez votre lien'}
                                        text={`Votre filleul crée son compte avec votre lien et profite de ${data.terms.discountPercent} % de réduction sur son premier mois.`}
                                    />
                                    <Step
                                        n={2}
                                        title={'Il règle ses premiers mois'}
                                        text={`Par sécurité, la récompense est versée une fois ${data.terms.requiredPaidMonths} mois réellement payés.`}
                                    />
                                    <Step
                                        n={3}
                                        title={`Vous gagnez ${euros(data.terms.rewardAmount)}`}
                                        text={'Le crédit est appliqué automatiquement sur vos prochaines factures.'}
                                    />
                                </div>
                            </Card>
                        </div>
                        <div css={tw`lg:col-span-3`}>
                            <Card padded={false}>
                                <div css={tw`px-6 pt-6`}><CardTitle>Vos filleuls</CardTitle></div>
                                {data.referrals.length === 0 ? (
                                    <EmptyState
                                        icon={faGift}
                                        title={'Aucun filleul pour le moment'}
                                        text={'Partagez votre lien : vos filleuls apparaîtront ici dès leur inscription.'}
                                    />
                                ) : (
                                    <ul>
                                        {data.referrals.map((referral, index) => (
                                            <li key={index} css={tw`flex items-center justify-between gap-4 border-t border-neutral-100 px-6 py-4`}>
                                                <div css={tw`flex items-center gap-3`}>
                                                    <div css={tw`flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500`}>
                                                        <FontAwesomeIcon icon={faUserPlus}/>
                                                    </div>
                                                    <div>
                                                        <p css={tw`text-sm font-bold text-neutral-900`}>{referral.name}</p>
                                                        <p css={tw`text-xs text-neutral-500`}>
                                                            Inscrit le {formatDate(referral.createdAt)} · {Math.min(referral.paidMonths, data.terms.requiredPaidMonths)}/{data.terms.requiredPaidMonths} mois payés
                                                        </p>
                                                    </div>
                                                </div>
                                                <div css={tw`text-right`}>
                                                    <Pill tone={statuses[referral.status].tone}>{statuses[referral.status].label}</Pill>
                                                    {referral.rewardAmount ? <p css={tw`mt-1 text-xs font-semibold text-green-700`}>+{euros(referral.rewardAmount)}</p> : null}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
