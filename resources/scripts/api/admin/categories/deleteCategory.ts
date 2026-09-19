import http from '@/api/http';

export default (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/categories/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};
