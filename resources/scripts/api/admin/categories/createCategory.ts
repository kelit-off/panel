import http from '@/api/http';
import { Category, rawDataToCategory } from '@/api/admin/categories/getCategories';

export default (name: string, description: string): Promise<Category> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/categories', { name, description })
            .then(({ data }) => resolve(rawDataToCategory(data)))
            .catch(reject);
    });
};
