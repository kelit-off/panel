import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import babelMacros from './resources/build/babelMacros';

const root = (p: string) => path.join(__dirname, p);

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: 'resources/scripts/index.tsx',
            refresh: false,
        }),
        react({ jsxRuntime: 'classic' } as never),
        babelMacros(),
    ],
    resolve: {
        alias: {
            // twin.macro emits imports from the macro entry; the Babel plugin already handles naming.
            'styled-components/macro': 'styled-components',
            '@': root('resources/scripts'),
            '@definitions': root('resources/scripts/api/definitions'),
            '@feature': root('resources/scripts/components/server/features'),
            // Chart.js tries to optionally require moment, which we never use.
            moment: root('resources/scripts/__mocks__/moment.cjs'),
        },
    },
    define: {
        global: 'globalThis',
        'process.env.I18N_DEBUG': JSON.stringify(process.env.I18N_DEBUG ?? 'false'),
        'process.env.NODE_ENV': JSON.stringify(mode),
    },
    css: {
        modules: {
            generateScopedName: mode === 'production' ? '[name]_[hash:base64:8]' : '[name]__[local]',
        },
    },
    server: {
        host: '0.0.0.0',
        port: 8080,
        cors: true,
        allowedHosts: ['.pterodactyl.test', 'localhost'],
    },
    build: {
        sourcemap: false,
        chunkSizeWarningLimit: 4000,
    },
}));
