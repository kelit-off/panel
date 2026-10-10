import http, { FractalResponseData } from '@/api/http';

export interface PromoCode {
    id: number;
    code: string;
    percentOff: number | null;
    amountOff: number | null;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths: number | null;
    productId: number | null;
    maxRedemptions: number | null;
    timesRedeemed: number;
    expiresAt: Date | null;
    isActive: boolean;
}

export interface PromoCodeFormData {
    code: string;
    percentOff: string;
    amountOff: string;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths: string;
    maxRedemptions: string;
    expiresAt: string;
}

const rawDataToPromoCode = ({ attributes }: FractalResponseData): PromoCode => ({
    id: attributes.id,
    code: attributes.code,
    percentOff: attributes.percent_off,
    amountOff: attributes.amount_off,
    duration: attributes.duration,
    durationInMonths: attributes.duration_in_months,
    productId: attributes.product_id,
    maxRedemptions: attributes.max_redemptions,
    timesRedeemed: attributes.times_redeemed,
    expiresAt: attributes.expires_at ? new Date(attributes.expires_at) : null,
    isActive: attributes.is_active,
});

export const getPromoCodes = async (): Promise<PromoCode[]> => {
    const { data } = await http.get('/api/application/promo-codes', { params: { per_page: 100, sort: '-id' } });

    return (data.data || []).map(rawDataToPromoCode);
};

export const createPromoCode = async (form: PromoCodeFormData): Promise<PromoCode> => {
    const { data } = await http.post('/api/application/promo-codes', {
        code: form.code,
        percent_off: form.percentOff ? Number(form.percentOff) : null,
        amount_off: form.amountOff ? Number(form.amountOff) : null,
        duration: form.duration,
        duration_in_months: form.duration === 'repeating' && form.durationInMonths ? Number(form.durationInMonths) : null,
        max_redemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        expires_at: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
    });

    return rawDataToPromoCode(data);
};

export const setPromoCodeActive = async (id: number, isActive: boolean): Promise<void> => {
    await http.patch(`/api/application/promo-codes/${id}`, { is_active: isActive });
};

export const deletePromoCode = async (id: number): Promise<void> => {
    await http.delete(`/api/application/promo-codes/${id}`);
};
