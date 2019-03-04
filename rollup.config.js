import path from 'path';
import { merge } from 'lodash';
import { terser } from 'rollup-plugin-terser';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';
import legacy from 'rollup-plugin-legacy';
import less from 'less';
import resolve from 'rollup-plugin-node-resolve';
import string from 'rollup-plugin-string';
import svelte from 'rollup-plugin-svelte';
import vizualizer from 'rollup-plugin-visualizer';
import pkg from './package.json';

const production = process.env.NODE_ENV === 'production';

const plugins = [
  resolve({ browser: true }),
  commonjs(),
  legacy({
    'node_modules/leader-line/leader-line.min.js': 'LeaderLine',
  }),
  json({
    preferConst: true,
  }),
  svelte({
    // Opt into v3 behavior today
    skipIntroByDefault: true,
    nestedTransitions: true,
    dev: !production,

    preprocess: {
      style: ({ content, attributes }) => {
        if (attributes.lang !== 'less') return;

        return less.render(content)
          .then(output => ({ code: output.css, map: output.map }));
      },
    },
  }),
  string({
    include: 'src/**/*.svg',
  }),
  buble({
    transforms: { dangerousForOf: true },
    objectAssign: true,
  }),
  filesize(),
];

const onwarn = warning => {
  // Silence circular dependency warning for moment package
  if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.importer.indexOf(path.normalize('node_modules')) === -1) {
    return;
  }

  console.warn(`(!) ${warning.message}`);
};

const config = {
  input: 'src/index.js',
  output: {
    file: pkg.browser,
    format: 'umd',
    name: 'Onboardist.UI',
    sourcemap: true,
  },
  watch: {
    include: 'src/**',
  },
  plugins: [
    ...plugins,
    vizualizer(),
  ],
  onwarn,
};

export default [
  // Dev version
  merge({}, config, {
    input: 'src/index.js',
    plugins,
    external: [
      'is-dom',
      'leader-line',
      'popper.js',
      'wait-for-the-element',
    ],
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true },
    ],
  }),

  config,

  // Minified version
  production ? merge({}, config, {
    watch: false,
    output: {
      file: 'dist/onboardist-ui.min.js',
    },
    plugins: [
      ...plugins,
      terser({ sourcemap: true }),
    ],
  }) : undefined,
].filter(x => Boolean(x));
