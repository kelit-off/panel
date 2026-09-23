import http from '@/api/http';

export interface AccountOrder {
    id: number;
    name: string | null;
    status: string;
    product: { name: string; price: string } | null;
    serverId: number | null;
    paidAt: Date | null;
    canWithdraw: boolean;
    withdrawalDeadline: Date | null;
}

const transform = (data: any): AccountOrder => ({
    id: data.id,
    name: data.name,
    status: data.status,
    product: data.product,
    serverId: data.server_id,
    paidAt: data.paid_at ? new Date(data.paid_at) : null,
    canWithdraw: data.can_withdraw,
    withdrawalDeadline: data.withdrawal_deadline ? new Date(data.withdrawal_deadline) : null,
});

export const getOrders = async (): Promise<AccountOrder[]> => {
    const { data } = await http.get('/api/client/orders');

    return data.data.map(transform);
};

export const cancelOrder = async (id: number): Promise<AccountOrder> => {
    const { data } = await http.post(`/api/client/orders/${id}/cancel`);

    return transform(data.data);
};

export const withdrawOrder = async (id: number): Promise<{ order: AccountOrder; refunded: number }> => {
    const { data } = await http.post(`/api/client/orders/${id}/withdraw`);

    return { order: transform(data.data), refunded: data.refunded };
};
