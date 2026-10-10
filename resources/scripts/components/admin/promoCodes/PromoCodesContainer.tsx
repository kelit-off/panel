import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import AdminBox from '@/components/admin/AdminBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import Spinner from '@/components/elements/Spinner';
import {
    createPromoCode,
    deletePromoCode,
    getPromoCodes,
    PromoCode,
    PromoCodeFormData,
    setPromoCodeActive,
} from '@/api/admin/promoCodes';

const emptyForm: PromoCodeFormData = {
    code: '',
    percentOff: '',
    amountOff: '',
    duration: 'once',
    durationInMonths: '3',
    maxRedemptions: '',
    expiresAt: '',
};

const describeDiscount = (promo: PromoCode): string => {
    const amount = promo.percentOff ? `−${promo.percentOff} %` : `−${Number(promo.amountOff).toFixed(2).replace('.', ',')} €`;
    const duration = promo.duration === 'once' ? '1er mois' : promo.duration === 'forever' ? 'à vie' : `${promo.durationInMonths} mois`;

    return `${amount} (${duration})`;
};

const Badge = ({ green, children }: { green: boolean; children: React.ReactNode }) => (
    <span css={[ tw`inline-block rounded-full px-2 py-px text-xs font-medium text-white`, green ? tw`bg-green-600` : tw`bg-neutral-600` ]}>
        {children}
    </span>
);

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ codes, setCodes ] = useState<PromoCode[] | null>(null);
    const [ form, setForm ] = useState<PromoCodeFormData>(emptyForm);
    const [ saving, setSaving ] = useState(false);

    const load = () => {
        clearFlashes('promo-codes');
        getPromoCodes()
            .then(setCodes)
            .catch(error => clearAndAddHttpError({ key: 'promo-codes', error }));
    };

    useEffect(load, []);

    const set = <K extends keyof PromoCodeFormData> (key: K, value: PromoCodeFormData[K]) => setForm(current => ({ ...current, [key]: value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        clearFlashes('promo-codes');
        setSaving(true);

        createPromoCode({ ...form, code: form.code.trim().toUpperCase() })
            .then(() => {
                setForm(emptyForm);
                load();
            })
            .catch(error => clearAndAddHttpError({ key: 'promo-codes', error }))
            .then(() => setSaving(false));
    };

    const toggle = (promo: PromoCode) => {
        setPromoCodeActive(promo.id, !promo.isActive).then(load).catch(error => clearAndAddHttpError({ key: 'promo-codes', error }));
    };

    const remove = (promo: PromoCode) => {
        if (!window.confirm(`Supprimer le code ${promo.code} ? Les commandes déjà passées avec ce code ne sont pas affectées.`)) return;

        deletePromoCode(promo.id).then(load).catch(error => clearAndAddHttpError({ key: 'promo-codes', error }));
    };

    return (
        <AdminContentBlock title={'Codes promo'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>Codes promo</h2>
                    <p css={tw`text-base text-neutral-400`}>Codes de réduction saisis par les clients au paiement. Un code ne peut être utilisé qu&apos;une fois par client et remplace la réduction de parrainage.</p>
                </div>
            </div>

            <FlashMessageRender byKey={'promo-codes'} css={tw`mb-4`}/>

            <AdminBox title={'Nouveau code'} css={tw`mb-6`} isLoading={saving}>
                <form onSubmit={submit}>
                    <div css={tw`grid grid-cols-1 gap-4 md:grid-cols-3`}>
                        <div>
                            <Label>Code</Label>
                            <Input required value={form.code} maxLength={40} placeholder={'BIENVENUE20'} onChange={e => set('code', e.target.value.toUpperCase())}/>
                            <p css={tw`mt-1 text-xs text-neutral-400`}>Lettres, chiffres, tirets.</p>
                        </div>
                        <div>
                            <Label>Réduction en %</Label>
                            <Input type={'number'} min={1} max={99} value={form.percentOff} disabled={!!form.amountOff} onChange={e => set('percentOff', e.target.value)}/>
                        </div>
                        <div>
                            <Label>ou réduction en €</Label>
                            <Input type={'number'} min={0.01} step={0.01} value={form.amountOff} disabled={!!form.percentOff} onChange={e => set('amountOff', e.target.value)}/>
                        </div>
                        <div>
                            <Label>Durée</Label>
                            <Select value={form.duration} onChange={e => set('duration', e.target.value as PromoCodeFormData['duration'])}>
                                <option value={'once'}>Premier mois seulement</option>
                                <option value={'repeating'}>Plusieurs mois</option>
                                <option value={'forever'}>Tant que l&apos;abonnement dure</option>
                            </Select>
                        </div>
                        {form.duration === 'repeating' &&
                            <div>
                                <Label>Nombre de mois</Label>
                                <Input type={'number'} min={1} max={36} value={form.durationInMonths} onChange={e => set('durationInMonths', e.target.value)}/>
                            </div>
                        }
                        <div>
                            <Label>Utilisations max (optionnel)</Label>
                            <Input type={'number'} min={1} value={form.maxRedemptions} onChange={e => set('maxRedemptions', e.target.value)}/>
                        </div>
                        <div>
                            <Label>Expire le (optionnel)</Label>
                            <Input type={'date'} value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)}/>
                        </div>
                    </div>
                    <div css={tw`mt-6 flex justify-end`}>
                        <Button type={'submit'} disabled={saving || !form.code || (!form.percentOff && !form.amountOff)}>Créer le code</Button>
                    </div>
                </form>
            </AdminBox>

            <AdminBox title={'Codes existants'} noPadding>
                {codes === null ?
                    <div css={tw`p-6 flex justify-center`}><Spinner size={'base'}/></div>
                    : codes.length < 1 ?
                        <p css={tw`p-6 text-sm text-neutral-400`}>Aucun code promo pour le moment.</p>
                        :
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto text-sm text-neutral-200`}>
                                <thead>
                                    <tr css={tw`text-left text-xs uppercase text-neutral-400`}>
                                        <th css={tw`px-6 py-3`}>Code</th>
                                        <th css={tw`px-6 py-3`}>Réduction</th>
                                        <th css={tw`px-6 py-3`}>Utilisations</th>
                                        <th css={tw`px-6 py-3`}>Expiration</th>
                                        <th css={tw`px-6 py-3`}>Statut</th>
                                        <th css={tw`px-6 py-3`}/>
                                    </tr>
                                </thead>
                                <tbody>
                                    {codes.map(promo => (
                                        <tr key={promo.id} css={tw`border-t border-white border-opacity-5`}>
                                            <td css={tw`px-6 py-3 font-mono font-bold whitespace-nowrap`}>{promo.code}</td>
                                            <td css={tw`px-6 py-3 whitespace-nowrap`}>{describeDiscount(promo)}</td>
                                            <td css={tw`px-6 py-3 whitespace-nowrap`}>{promo.timesRedeemed}{promo.maxRedemptions ? ` / ${promo.maxRedemptions}` : ''}</td>
                                            <td css={tw`px-6 py-3 whitespace-nowrap`}>{promo.expiresAt ? promo.expiresAt.toLocaleDateString('fr-FR') : '—'}</td>
                                            <td css={tw`px-6 py-3 whitespace-nowrap`}>
                                                <Badge green={promo.isActive}>{promo.isActive ? 'Actif' : 'Désactivé'}</Badge>
                                            </td>
                                            <td css={tw`px-6 py-3 text-right whitespace-nowrap`}>
                                                <Button type={'button'} size={'xsmall'} isSecondary color={'grey'} css={tw`mr-2`} onClick={() => toggle(promo)}>
                                                    {promo.isActive ? 'Désactiver' : 'Activer'}
                                                </Button>
                                                <Button type={'button'} size={'xsmall'} color={'red'} isSecondary onClick={() => remove(promo)}>Supprimer</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                }
            </AdminBox>
        </AdminContentBlock>
    );
};
