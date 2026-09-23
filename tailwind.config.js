const colors = require('tailwindcss/colors');

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: [ '"Manrope"', '"IBM Plex Sans"', 'system-ui', 'sans-serif' ],
                vitrine: [ '"Manrope"', 'system-ui', 'sans-serif' ],
                'vitrine-display': [ '"Space Grotesk"', '"Manrope"', 'system-ui', 'sans-serif' ],
            },
            colors: {
                black: '#0b0f14',
                // Brand accent (logo mark): #3DDC97 on dark backgrounds, #0E9A62
                // on light ones — 400/600 below carry those exact values so every
                // primary-* usage across the app follows the same palette.
                primary: {
                    50: '#eafbf3',
                    100: '#d2f6e4',
                    200: '#a6edc9',
                    300: '#71dfac',
                    400: '#3ddc97',
                    500: '#22c285',
                    600: '#0e9a62',
                    700: '#0b7f50',
                    800: '#0a6742',
                    900: '#085234',
                },
                // Deprecate, prefer "gray"...
                neutral: colors.gray,
                cyan: colors.cyan,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
