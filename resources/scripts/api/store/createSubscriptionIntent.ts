import http from '@/api/http';

export interface SubscriptionIntent {
    order: { id: number };
    product: { name: string; price: string };
    publishableKey: string;
    clientSecret: string;
}

export default async (productId: number | string, name: string): Promise<SubscriptionIntent> => {
    const { data } = await http.post(`/api/store/products/${productId}/checkout`, { name });

    return data;
};
