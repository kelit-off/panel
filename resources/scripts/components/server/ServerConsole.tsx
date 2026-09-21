import React, { lazy, memo } from 'react';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import ServerOverview from '@/components/server/ServerOverview';
import isEqual from 'react-fast-compare';
import { EulaModalFeature, JavaVersionModalFeature, GSLTokenModalFeature, PIDLimitModalFeature, SteamDiskSpaceFeature } from '@feature/index';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import Spinner from '@/components/elements/Spinner';

const ChunkedConsole = lazy(() => import(/* webpackChunkName: "console" */'@/components/server/Console'));
const ChunkedStatGraphs = lazy(() => import(/* webpackChunkName: "graphs" */'@/components/server/StatGraphs'));

const ServerConsole = () => {
    const eggFeatures = ServerContext.useStoreState(state => state.server.data!.eggFeatures, isEqual);

    return (
        <ServerContentBlock title={'Console'}>
            <ServerOverview/>

            <div css={tw`mt-4`}>
                <Spinner.Suspense>
                    <ErrorBoundary>
                        <ChunkedConsole/>
                    </ErrorBoundary>
                    <ChunkedStatGraphs/>
                </Spinner.Suspense>
            </div>

            <React.Suspense fallback={null}>
                {eggFeatures.includes('eula') && <EulaModalFeature/>}
                {eggFeatures.includes('java_version') && <JavaVersionModalFeature/>}
                {eggFeatures.includes('gsl_token') && <GSLTokenModalFeature/>}
                {eggFeatures.includes('pid_limit') && <PIDLimitModalFeature/>}
                {eggFeatures.includes('steam_disk_space') && <SteamDiskSpaceFeature/>}
            </React.Suspense>
        </ServerContentBlock>
    );
};

export default memo(ServerConsole, isEqual);
