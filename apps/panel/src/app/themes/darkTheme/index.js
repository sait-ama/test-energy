import { houseDarkTheme } from 'react-admin';

import { components } from './components.js';
import { palette } from './palette.js';
import { typography } from './typography.js';

export const darkTheme = {
    ...houseDarkTheme,
    palette: {
        mode: 'dark',
        ...palette,
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        ...typography,
    },
    sidebar: {
        width: 250,
    },
    components: {
        ...components,
    },
    mixins: {
        toolbar: {
            minHeight: 56,
            '@media (min-width:0px)': {
                '@media (orientation: landscape)': {
                    minHeight: 48,
                },
            },
            '@media (min-width:600px)': {
                minHeight: 64,
            },
        },
    },
};
