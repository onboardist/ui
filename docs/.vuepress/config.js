const path = require('path');
const pkg = require('../../package.json');

const port = 10002;

const production = process.env.NODE_ENV && process.env.NODE_ENV === 'production';

module.exports = {
  title: 'Onboardist UI',
  description: 'Composable UI components for user onboarding',

  port,
  base: production ? '/ui/' : null,
  plugins: [
    require('./dist-static-plugin'),
  ],
  head: [
    (process.env.NODE_ENV && ~process.env.NODE_ENV.indexOf('dev'))
      ? ['script', { src: `http://localhost:${port}/dist/onboardist-ui.umd.js`} ]
      : ['script', { src: `https://unpkg.com/@onboardist/ui@${pkg.version}/dist/onboardist-ui.min.js`} ],

    (process.env.NODE_ENV && ~process.env.NODE_ENV.indexOf('dev'))
      ? ['script', { src: `http://localhost:35729/livereload.js`} ]
      : [],
  ],

  markdown: {
    extendMarkdown: md => {
      md.use(require('markdown-it-include'), path.resolve(path.join(__dirname, '../include')));
    },
  },

  themeConfig: {
    repo: 'onboardist/ui',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
    ],

    sidebar: [
      {
        title: 'Guide',
        collapsable: false,
        children: [
          '/guide/',
          '/guide/installation/',
          '/guide/config/',
          '/guide/api/',
          '/guide/events/',
        ],
      },
      {
        title: 'Components',
        collapsable: false,
        children: [
          '/components/coachmark/',
          '/components/hotspot/',
          '/components/modal/',
          '/components/tooltip/',
          '/components/tour/',
        ],
      },
      {
        title: 'Examples',
        collapsable: false,
        children: [
          '/examples/dom-events/',
          '/examples/onboardist-events/',
          '/examples/tours/hide-next-button/',
          '/examples/tours/wait-for-element/',
        ],
      }
    ]
  }
};