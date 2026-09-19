import { action, Action } from 'easy-peasy';

export interface AdminProductStore {
    selectedProducts: number[];

    setSelectedProducts: Action<AdminProductStore, number[]>;
    appendSelectedProduct: Action<AdminProductStore, number>;
    removeSelectedProduct: Action<AdminProductStore, number>;
}

const products: AdminProductStore = {
    selectedProducts: [],

    setSelectedProducts: action((state, payload) => {
        state.selectedProducts = payload;
    }),

    appendSelectedProduct: action((state, payload) => {
        state.selectedProducts = state.selectedProducts.filter(id => id !== payload).concat(payload);
    }),

    removeSelectedProduct: action((state, payload) => {
        state.selectedProducts = state.selectedProducts.filter(id => id !== payload);
    }),
};

export default products;
