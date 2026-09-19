import http from '@/api/http';
import { Product, rawDataToProduct } from '@/api/admin/products/getProducts';
import { ProductFormData, productFormDataToPayload } from '@/api/admin/products/ProductFormData';

export default (id: number, data: ProductFormData): Promise<Product> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/products/${id}`, productFormDataToPayload(data))
            .then(({ data }) => resolve(rawDataToProduct(data)))
            .catch(reject);
    });
};
