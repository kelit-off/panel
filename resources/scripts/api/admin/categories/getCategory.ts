import http from '@/api/http';
import { Category, rawDataToCategory } from '@/api/admin/categories/getCategories';

export default (id: number): Promise<Category> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/categories/${id}`)
            .then(({ data }) => resolve(rawDataToCategory(data)))
            .catch(reject);
    });
};
