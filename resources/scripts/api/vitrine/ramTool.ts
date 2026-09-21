export type RamLoader = 'vanilla' | 'paper' | 'fabric' | 'forge';
export type RamWeight = 'light' | 'standard' | 'heavy';

export interface RamParams {
    loader: RamLoader;
    mods: number;
    weight: RamWeight;
    players: number;
    view: number;
}

export interface RamPlan {
    id: number;
    name: string;
    ram: string;
    priceLabel: string;
    game: string;
    gameSlug: string;
}

export interface RamEstimate {
    minimumGb: number;
    recommendedGb: number;
    estimateGb: number;
    breakdown: { label: string; gb: number }[];
    plans: { minimum: RamPlan | null; recommended: RamPlan | null };
}

export interface RamGuide {
    title: string;
    intro: string;
    method: string[];
    disclaimer: string;
    faqs: { question: string; answer: string }[];
    scenarios: {
        label: string;
        summary: string;
        minimumGb: number;
        recommendedGb: number;
        plan: { id: number; name: string; priceLabel: string } | null;
    }[];
}

// Plain fetch on purpose: the calculator queries on every slider move, which
// must not drive the global progress bar of the shared axios client.
const getJson = async (path: string): Promise<any> => {
    const response = await fetch(path, { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
};

export const getRamEstimate = async (params: RamParams): Promise<RamEstimate> => {
    const query = new URLSearchParams({
        loader: params.loader,
        mods: String(params.mods),
        weight: params.weight,
        players: String(params.players),
        view: String(params.view),
    });
    const data = await getJson(`/api/vitrine/tools/minecraft-ram?${query.toString()}`);

    return {
        minimumGb: data.minimum_gb,
        recommendedGb: data.recommended_gb,
        estimateGb: data.estimate_gb,
        breakdown: data.breakdown,
        plans: data.plans,
    };
};

export const getRamGuide = (): Promise<RamGuide> => getJson('/api/vitrine/tools/minecraft-ram/guide');
