import { action, Action } from 'easy-peasy';

export interface SiteSettings {
    name: string;
    locale: string;
    recaptcha: {
        enabled: boolean;
        siteKey: string;
    };
    analytics: string;
    features: {
        pullFiles: boolean;
    };
    categories: {
        id: number;
        name: string;
        nests: { id: number; name: string; slug: string; fromPrice: string | null }[];
    }[];
    hero: { title: string; text: string };
    faqs: { question: string; answer: string }[];
    inclusions: { key: string; title: string; description: string }[];
}

export interface SettingsStore {
    data?: SiteSettings;
    setSettings: Action<SettingsStore, SiteSettings>;
}

const settings: SettingsStore = {
    data: undefined,

    setSettings: action((state, payload) => {
        state.data = payload;
    }),
};

export default settings;
