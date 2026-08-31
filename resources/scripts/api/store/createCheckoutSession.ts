import http from '@/api/http';

export default async (productId: number | string): Promise<string> => {
    const { data } = await http.post(`/api/store/products/${productId}/checkout`);

    return data.url;
};
