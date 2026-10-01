import { ServerContext } from '@/state/server';

// Egg feature that turns a server into a website (see config/webhosting.php).
export const WEBSITE_FEATURE = 'web';

export const isWebsite = (eggFeatures: string[]): boolean => eggFeatures.includes(WEBSITE_FEATURE);

export default (): boolean => ServerContext.useStoreState(state => isWebsite(state.server.data?.eggFeatures || []));
