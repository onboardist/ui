const pkg = require('../../package.json');

const port = 10002;

module.exports = {
  title: 'Onboardist UI',
  description: 'Composable UI components for user onboarding',

  port,
  base: '/ui/',
  plugins: [
    require('./dist-static-plugin'),
  ],
  head: [
    (process.env.NODE_ENV && ~process.env.NODE_ENV.indexOf('dev'))
      ? ['script', { src: `http://localhost:${port}/dist/index.js`} ]
      : ['script', { src: `https://unpkg.com/@onboardist/ui@${pkg.version}/dist/index.min.js`} ]
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
          '/guide/config/',
          '/guide/api/',
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