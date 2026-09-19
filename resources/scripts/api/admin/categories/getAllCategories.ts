import http from '@/api/http';
import { Category, rawDataToCategory } from '@/api/admin/categories/getCategories';

/**
 * Fetches every category in one page for use in a plain <select> — there are
 * only ever a handful of storefront categories, so pagination is unnecessary.
 */
export default (): Promise<Category[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/application/categories', { params: { per_page: 100 } })
            .then(({ data }) => resolve((data.data || []).map(rawDataToCategory)))
            .catch(reject);
    });
};
