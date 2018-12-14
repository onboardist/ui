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
      ? ['script', { src: `http://localhost:${port}/dist/index.js`} ]
      : ['script', { src: `https://unpkg.com/@onboardist/ui@${pkg.version}/dist/index.min.js`} ]
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
    ]
  }
};