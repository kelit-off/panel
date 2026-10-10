import http from '@/api/http';

export interface SubscriptionIntent {
    order: { id: number };
    product: { name: string; price: string; discountPercent?: number | null; promoPrice?: string | null };
    publishableKey: string;
    clientSecret: string;
}

export default async (productId: number | string, name: string, immediateStart: boolean, promoCode?: string): Promise<SubscriptionIntent> => {
    const { data } = await http.post(`/api/store/products/${productId}/checkout`, { name, immediate_start: immediateStart, promo_code: promoCode || undefined });

    return { ...data, product: { ...data.product, discountPercent: data.product.discount_percent, promoPrice: data.product.promo_price } };
};

export interface PromoPreview {
    code: string;
    percentOff: number | null;
    amountOff: number | null;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths: number | null;
    discountedPrice: string;
}

export const checkPromoCode = async (productId: number | string, code: string): Promise<PromoPreview> => {
    const { data } = await http.post(`/api/store/products/${productId}/promo`, { code });

    return {
        code: data.code,
        percentOff: data.percent_off,
        amountOff: data.amount_off,
        duration: data.duration,
        durationInMonths: data.duration_in_months,
        discountedPrice: data.discounted_price,
    };
};
