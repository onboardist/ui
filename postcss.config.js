const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    require('postcss-import'),
    // require('postcss-url'),
    require('tailwindcss')('./tailwind.config.js'),
    purgecss({
      content: ['./src/**/*.svelte'],
    }),
    // require('postcss-flexbugs-fixes'),
    // require('autoprefixer')({
    //   browsers: [
    //     '>1%',
    //     'last 4 versions',
    //     'Firefox ESR',
    //     'not ie < 9'
    //   ],
    //   flexbox: 'no-2009'
    // })
  ]
};