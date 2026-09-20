export const formatMoney = (value: number): string => value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
});

export const formatCount = (value: number): string => value.toLocaleString('fr-FR');

export const formatSize = (mb: number): string => (
    mb >= 1024 ? `${(mb / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Go` : `${mb} Mo`
);

export const formatDay = (date: Date): string => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

export const formatDayLong = (date: Date): string => date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });

export interface Delta {
    direction: 'up' | 'down' | 'flat';
    label: string;
}

export const computeDelta = (current: number, previous: number): Delta => {
    if (current === previous) {
        return { direction: 'flat', label: 'stable' };
    }

    if (previous === 0) {
        return { direction: 'up', label: 'nouveau' };
    }

    const percent = Math.round(((current - previous) / previous) * 100);

    if (percent === 0) {
        return { direction: 'flat', label: 'stable' };
    }

    return { direction: percent > 0 ? 'up' : 'down', label: `${percent > 0 ? '+' : ''}${percent} %` };
};
