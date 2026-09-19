import http from '@/api/http';
import { Category, rawDataToCategory } from '@/api/admin/categories/getCategories';

export default (id: number, name: string, description: string, isActive: boolean): Promise<Category> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/categories/${id}`, { name, description, is_active: isActive })
            .then(({ data }) => resolve(rawDataToCategory(data)))
            .catch(reject);
    });
};
