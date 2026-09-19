export interface ProductFormData {
    nestId: number;
    name: string;
    description: string;
    price: string;
    stripePriceId: string;
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    databases: number;
    backups: number;
    allocations: number;
    isActive: boolean;
}

export const productFormDataToPayload = (data: ProductFormData) => ({
    nest_id: data.nestId,
    name: data.name,
    description: data.description || null,
    price: data.price,
    stripe_price_id: data.stripePriceId || null,
    memory: data.memory,
    swap: data.swap,
    disk: data.disk,
    io: data.io,
    cpu: data.cpu,
    databases: data.databases,
    backups: data.backups,
    allocations: data.allocations,
    is_active: data.isActive,
});
