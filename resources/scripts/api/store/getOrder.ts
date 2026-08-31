import http from '@/api/http';

export interface StoreOrder {
    status: 'pending' | 'paid' | 'active' | 'failed' | 'cancelled';
    server: { id: number; uuid: string } | null;
}

export default async (orderId: number | string): Promise<StoreOrder> => {
    const { data } = await http.get(`/api/store/orders/${orderId}`);

    return data;
};
