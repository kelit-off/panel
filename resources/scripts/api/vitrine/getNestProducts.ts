import http from '@/api/http';

export interface StoreNestProduct {
    id: number;
    name: string;
    description: string | null;
    price: string;
    memory: number;
    disk: number;
    cpu: number;
    databases: number;
    backups: number;
    allocations: number;
}

export interface StoreNestProducts {
    nest: { id: number; name: string; description: string | null };
    products: StoreNestProduct[];
}

export default async (nestId: number | string): Promise<StoreNestProducts> => {
    const { data } = await http.get(`/api/vitrine/nests/${nestId}/products`);

    return data;
};
