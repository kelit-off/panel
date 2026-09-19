import { action, Action } from 'easy-peasy';

export interface AdminCategoryStore {
    selectedCategories: number[];

    setSelectedCategories: Action<AdminCategoryStore, number[]>;
    appendSelectedCategory: Action<AdminCategoryStore, number>;
    removeSelectedCategory: Action<AdminCategoryStore, number>;
}

const categories: AdminCategoryStore = {
    selectedCategories: [],

    setSelectedCategories: action((state, payload) => {
        state.selectedCategories = payload;
    }),

    appendSelectedCategory: action((state, payload) => {
        state.selectedCategories = state.selectedCategories.filter(id => id !== payload).concat(payload);
    }),

    removeSelectedCategory: action((state, payload) => {
        state.selectedCategories = state.selectedCategories.filter(id => id !== payload);
    }),
};

export default categories;
