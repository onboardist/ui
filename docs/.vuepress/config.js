const pkg = require('../../package.json');

const port = 10002;

module.exports = {
  title: 'Onboardist UI',
  description: 'Composable UI components for user onboarding',

  port,
  plugins: [
    require('./dist-static-plugin'),
  ],
  watch: ['../../dist/**'],
  head: [
    (process.env.NODE_ENV && ~process.env.NODE_ENV.indexOf('dev'))
      ? ['script', { src: `http://localhost:${port}/dist/index.js`} ]
      : ['script', { src: `https://cdn.rawgit.com/onboardist/coachmarks/${pkg.version}/dist/index.min.js`} ],
    (process.env.NODE_ENV && ~process.env.NODE_ENV.indexOf('dev'))
      ? ['link', { rel: 'stylesheet', href: `http://localhost:${port}/dist/index.css`} ]
      : ['link', { rel: 'stylesheet', href: `https://cdn.rawgit.com/onboardist/coachmarks/${pkg.version}/dist/index.css`} ],
  ],

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
          '/guide/api/'
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
      // {
      //   title: 'Tours',
      //   collapsable: false,
      //   children: [
      //     '/tours/',
      //   ],
      // },
    ]
  }
};