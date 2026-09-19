import http, { FractalResponseData, getPaginationSet, PaginatedResult } from '@/api/http';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api/admin';

export interface Product {
    id: number;
    nestId: number;
    name: string;
    description: string | null;
    price: string;
    stripePriceId: string | null;
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    databases: number;
    backups: number;
    allocations: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const rawDataToProduct = ({ attributes }: FractalResponseData): Product => ({
    id: attributes.id,
    nestId: attributes.nest_id,
    name: attributes.name,
    description: attributes.description,
    price: attributes.price,
    stripePriceId: attributes.stripe_price_id,
    memory: attributes.memory,
    swap: attributes.swap,
    disk: attributes.disk,
    io: attributes.io,
    cpu: attributes.cpu,
    databases: attributes.databases,
    backups: attributes.backups,
    allocations: attributes.allocations,
    isActive: attributes.is_active,
    createdAt: new Date(attributes.created_at),
    updatedAt: new Date(attributes.updated_at),
});

export interface Filters {
    id?: string;
    name?: string;
}

export const Context = createContext<Filters>();

export default (include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(Context);

    const params = {};
    if (filters !== null) {
        Object.keys(filters).forEach(key => {
            // @ts-ignore
            params['filter[' + key + ']'] = filters[key];
        });
    }

    if (sort !== null) {
        // @ts-ignore
        params.sort = (sortDirection ? '-' : '') + sort;
    }

    return useSWR<PaginatedResult<Product>>([ 'products', page, filters, sort, sortDirection ], async () => {
        const { data } = await http.get('/api/application/products', { params: { include: include.join(','), page, ...params } });

        return ({
            items: (data.data || []).map(rawDataToProduct),
            pagination: getPaginationSet(data.meta.pagination),
        });
    });
};
