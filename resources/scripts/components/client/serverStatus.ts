import { Server } from '@definitions/user';

type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'neutral';

export const serverStatus = (server: Server): { label: string; tone: Tone } => {
    if (server.status === 'suspended') return { label: 'Suspendu', tone: 'red' };
    if (server.status === 'install_failed') return { label: 'Installation échouée', tone: 'red' };
    if (server.status === 'installing' || server.isInstalling) return { label: 'Installation…', tone: 'yellow' };
    if (server.status === 'restoring_backup') return { label: 'Restauration…', tone: 'yellow' };
    if (server.isTransferring) return { label: 'Transfert…', tone: 'blue' };

    return { label: 'Actif', tone: 'green' };
};
