import http from '@/api/http';
import { Product, rawDataToProduct } from '@/api/admin/products/getProducts';

export default (id: number): Promise<Product> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/products/${id}`)
            .then(({ data }) => resolve(rawDataToProduct(data)))
            .catch(reject);
    });
};
