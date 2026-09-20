import http from '@/api/http';

export type Range = 7 | 30 | 90;

export interface Analytics {
    range: Range;
    kpis: {
        mrr: number;
        mrrAtRisk: number;
        averageRevenuePerCustomer: number;
        sold: number;
        soldPrevious: number;
        orders: number;
        ordersPrevious: number;
        customers: number;
        customersPrevious: number;
        ended: number;
        endedPrevious: number;
        servicesActive: number;
        servicesSuspended: number;
        ticketsWaiting: number;
    };
    series: { date: Date; customers: number; orders: number; sold: number }[];
    byProduct: { name: string; services: number; mrr: number }[];
    orderStatuses: Record<string, number>;
    nodes: {
        id: number;
        name: string;
        servers: number;
        memory: { used: number; limit: number };
        disk: { used: number; limit: number };
    }[];
}

const parseDay = (value: string): Date => {
    const [ year, month, day ] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
};

export default async (range: Range): Promise<Analytics> => {
    const { data } = await http.get('/api/application/analytics', { params: { range } });
    const k = data.kpis;

    return {
        range: data.range,
        kpis: {
            mrr: k.mrr,
            mrrAtRisk: k.mrr_at_risk,
            averageRevenuePerCustomer: k.average_revenue_per_customer,
            sold: k.sold,
            soldPrevious: k.sold_previous,
            orders: k.orders,
            ordersPrevious: k.orders_previous,
            customers: k.customers,
            customersPrevious: k.customers_previous,
            ended: k.ended,
            endedPrevious: k.ended_previous,
            servicesActive: k.services_active,
            servicesSuspended: k.services_suspended,
            ticketsWaiting: k.tickets_waiting,
        },
        series: data.series.map((point: any) => ({ ...point, date: parseDay(point.date) })),
        byProduct: data.by_product,
        orderStatuses: data.order_statuses,
        nodes: data.nodes,
    };
};
