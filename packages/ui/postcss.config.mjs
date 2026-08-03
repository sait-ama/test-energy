export default {
  plugins: {
    '@tailwindcss/postcss': {},
    // 'postcss-rename': {
    //     strategy: 'minimal',
    //     by: 'whole',
    //     ids: true,
    // },
    // 'postcss-transform-shortcut': {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
