type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'neutral';

const statuses: Record<string, { label: string; tone: Tone }> = {
    open: { label: 'Ouvert', tone: 'yellow' },
    answered: { label: 'Répondu', tone: 'green' },
    'customer-reply': { label: 'En attente du support', tone: 'blue' },
    closed: { label: 'Fermé', tone: 'neutral' },
};

export const ticketStatus = (status: string): { label: string; tone: Tone } => statuses[status] || { label: status, tone: 'neutral' };
