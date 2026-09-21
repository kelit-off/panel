import http from '@/api/http';

export type BusinessRange = 7 | 30 | 90 | 365;

export interface BreakdownRow {
    name: string;
    services: number;
    mrr: number;
    share: number;
}

export interface RevenueAnalytics {
    range: BusinessRange;
    kpis: {
        mrr: number;
        arr: number;
        mrrStart: number;
        mrrGrowth: number | null;
        newMrr: number;
        churnedMrr: number;
        mrrAtRisk: number;
        arpu: number;
        payingCustomers: number;
        services: number;
        customerChurn: number | null;
        revenueChurn: number | null;
        ltv: number | null;
        lifetimeMonths: number | null;
    };
    series: { date: Date; mrr: number; new: number; churned: number }[];
    byGame: BreakdownRow[];
    byProduct: BreakdownRow[];
    topCustomers: { id: number; name: string; email: string | null; services: number; mrr: number; share: number }[];
}

export interface CustomerAnalytics {
    range: BusinessRange;
    kpis: {
        customersTotal: number;
        newCustomers: number;
        newCustomersPrevious: number;
        activationRate: number | null;
        payingCustomers: number;
        multiServiceRate: number | null;
        servicesPerCustomer: number | null;
        provisioningFailures: number;
        provisioningFailureRate: number | null;
    };
    cohorts: { cohort: string; size: number; retention: (number | null)[] }[];
}

export interface FunnelStages {
    visitors: number;
    games: number;
    checkout: number;
    started: number;
    paid: number;
    provisioned: number;
}

export interface FunnelAnalytics {
    range: BusinessRange;
    tracking: boolean;
    stages: FunnelStages;
    stagesPrevious: FunnelStages;
    series: { date: Date; visitors: number; started: number; paid: number }[];
    byGame: {
        name: string;
        visitors: number;
        checkout: number;
        started: number;
        paid: number;
        sold: number;
        conversion: number | null;
    }[];
    byProduct: {
        name: string;
        game: string | null;
        checkout: number;
        started: number;
        paid: number;
        abandoned: number;
        abandonedValue: number;
        conversion: number | null;
    }[];
    sources: { direct: number; referrers: { host: string; visitors: number }[] };
    abandoned: { checkouts: number; value: number };
    ai: {
        crawlers: { bot: string; operator: string; purpose: string; hits: number; pages: number; lastSeen: string }[];
        topPages: { path: string; hits: number }[];
        referrals: { name: string; visitors: number }[];
        referralVisitors: number;
    };
}

export interface CapacityAnalytics {
    nodes: {
        id: number;
        name: string;
        servers: number;
        memory: { used: number; limit: number };
        disk: { used: number; limit: number };
        mrr: number;
        mrrPerGb: number | null;
        memoryDaysLeft: number | null;
        diskDaysLeft: number | null;
    }[];
}

const camel = (key: string): string => key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

const camelize = (value: any): any => {
    if (Array.isArray(value)) {
        return value.map(camelize);
    }

    if (value && typeof value === 'object') {
        return Object.keys(value).reduce((result, key) => ({ ...result, [camel(key)]: camelize(value[key]) }), {});
    }

    return value;
};

const parseDay = (value: string): Date => {
    const [ year, month, day ] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
};

const withDates = <T extends { series: any[] }>(data: T): T => ({
    ...data,
    series: data.series.map(point => ({ ...point, date: parseDay(point.date) })),
});

const fetchAnalytics = async (path: string, range?: BusinessRange) => {
    const { data } = await http.get(`/api/application/analytics/${path}`, { params: range ? { range } : {} });

    return camelize(data);
};

export const getRevenueAnalytics = async (range: BusinessRange): Promise<RevenueAnalytics> => withDates(await fetchAnalytics('revenue', range));

export const getCustomerAnalytics = async (range: BusinessRange): Promise<CustomerAnalytics> => fetchAnalytics('customers', range);

export const getFunnelAnalytics = async (range: BusinessRange): Promise<FunnelAnalytics> => withDates(await fetchAnalytics('funnel', range));

export const getCapacityAnalytics = async (): Promise<CapacityAnalytics> => fetchAnalytics('capacity');
