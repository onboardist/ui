import { merge } from 'lodash';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';
import legacy from 'rollup-plugin-legacy';
import resolve from 'rollup-plugin-node-resolve';
import less from 'less';
import string from 'rollup-plugin-string';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
// import vizualizer from 'rollup-plugin-visualizer';
import pkg from './package.json';

const production = process.env.NODE_ENV === 'production';

const config = {
  input: 'src/index.js',
  output: {
    file: pkg.main,
    format: 'umd',
    name: 'Onboardist.UI',
    sourcemap: true,
  },
  watch: {
    include: 'src/**',
  },
  plugins: [
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
    // vizualizer(),
  ],
};

export default [
  // Dev version
  config,
  // Minified version
  production ? merge({}, config, {
    watch: false,
    output: {
      file: `dist/index.min.js`,
    },
    plugins: [
      terser({ sourcemap: true }),
    ],
  }) : undefined,
  // Module
  production ? merge({}, config, {
    watch: false,
    // NOTE: this externalizes leader-line, which won't work because it exports a global variable that has to be loaded with a special loader
    // external: Object.keys(pkg.dependencies).concat(['path-svg/svg-path']),
    external: [
      'lodash',
      'raf',
    ],
    output: {
      file: pkg.module,
      format: 'es',
    },
  }) : undefined,
].filter(x => !!x);
