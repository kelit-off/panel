import http from '@/api/http';

export interface Overview {
    counts: {
        customers: number;
        servers: number;
        nodes: number;
        products: number;
        orders: number;
        ordersActive: number;
        ordersFailed: number;
        ticketsWaiting: number;
    };
    recentTickets: { id: number; subject: string; status: string; customer: string | null; updatedAt: Date }[];
    recentOrders: { id: number; status: string; product: string | null; customer: string | null; createdAt: Date }[];
}

export default async (): Promise<Overview> => {
    const { data } = await http.get('/api/application/overview');

    return {
        counts: {
            customers: data.counts.customers,
            servers: data.counts.servers,
            nodes: data.counts.nodes,
            products: data.counts.products,
            orders: data.counts.orders,
            ordersActive: data.counts.orders_active,
            ordersFailed: data.counts.orders_failed,
            ticketsWaiting: data.counts.tickets_waiting,
        },
        recentTickets: data.recent_tickets.map((t: any) => ({ ...t, updatedAt: new Date(t.updated_at) })),
        recentOrders: data.recent_orders.map((o: any) => ({ ...o, createdAt: new Date(o.created_at) })),
    };
};
