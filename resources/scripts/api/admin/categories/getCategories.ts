import http, { FractalResponseData, getPaginationSet, PaginatedResult } from '@/api/http';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api/admin';

export interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const rawDataToCategory = ({ attributes }: FractalResponseData): Category => ({
    id: attributes.id,
    name: attributes.name,
    description: attributes.description,
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

    return useSWR<PaginatedResult<Category>>([ 'categories', page, filters, sort, sortDirection ], async () => {
        const { data } = await http.get('/api/application/categories', { params: { include: include.join(','), page, ...params } });

        return ({
            items: (data.data || []).map(rawDataToCategory),
            pagination: getPaginationSet(data.meta.pagination),
        });
    });
};
