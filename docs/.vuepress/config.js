const pkg = require('../../package.json');

module.exports = {
  title: 'Onboardist UI',
  description: 'Composable UI components for user onboarding',

  plugins: [
    require('./dist-static-plugin'),
  ],

  head: [
    (process.env.NODE_ENV && ~process.env.NODE_ENV.indexOf('dev'))
      ? ['script', { src: 'http://localhost:8080/dist/index.js'} ]
      : ['script', { src: `https://cdn.rawgit.com/onboardist/coachmarks/${pkg.version}/dist/index.min.js`} ]
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