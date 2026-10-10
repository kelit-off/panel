import { transformAsync } from '@babel/core';
import type { Plugin } from 'vite';

/**
 * Runs twin.macro and styled-components through Babel before Vite's own TypeScript/JSX
 * transform. This mirrors what babel-loader did in the old webpack setup.
 */
export default function babelMacros(): Plugin {
    return {
        name: 'panel:babel-macros',
        enforce: 'pre',
        async transform(code, id) {
            const file = id.split('?')[0];
            if (!/[\/]resources[\/]scripts[\/].*\.[jt]sx?$/.test(file) || /\.spec\.[jt]sx?$/.test(file)) {
                return null;
            }
            // Only files that use the macros need to be touched.
            if (!/twin\.macro|styled-components/.test(code)) {
                return null;
            }

            const result = await transformAsync(code, {
                filename: file,
                configFile: false,
                babelrc: false,
                sourceMaps: true,
                parserOpts: { plugins: ['typescript', 'jsx'] },
                plugins: [
                    'babel-plugin-macros',
                    ['babel-plugin-styled-components', { pure: true, displayName: true, fileName: true }],
                ],
            });

            return result?.code ? { code: result.code, map: result.map as never } : null;
        },
    };
}
