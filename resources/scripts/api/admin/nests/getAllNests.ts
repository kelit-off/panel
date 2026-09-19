import http from '@/api/http';
import { Nest, rawDataToNest } from '@/api/admin/nests/getNests';

/**
 * Fetches every nest in one page for use in a plain <select> — the storefront
 * only ever has a handful of games, so pagination would be unnecessary here.
 */
export default (): Promise<Nest[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/application/nests', { params: { per_page: 100 } })
            .then(({ data }) => resolve((data.data || []).map(rawDataToNest)))
            .catch(reject);
    });
};
