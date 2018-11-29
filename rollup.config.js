import { merge } from 'lodash';
// import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import getPreprocessor from 'svelte-preprocess';
import legacy from 'rollup-plugin-legacy';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
import postcssLess from 'postcss-less';
import postcssPlugin from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import string from 'rollup-plugin-string';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
// import typescript from 'rollup-plugin-typescript';
// import * as ts from 'typescript';
// import rollupAnalyzer from 'rollup-analyzer-plugin';
import pkg from './package.json';


const production = process.env.NODE_ENV === 'production';

const preprocess = getPreprocessor({
  transformers: {
    postcss: true,
    less: true,
  },
});

const config = {
  cache: false,
  input: 'src/index.js',
  output: {
    file: pkg.main,
    format: 'umd',
    name: 'OnboardistUI',
    sourcemap: true,
  },
  plugins: [
    // typescript({ target: 'es5' }),
    resolve({ browser: true }),
    commonjs(),
    legacy({
      'node_modules/leader-line/leader-line.min.js': 'LeaderLine',
    }),
    postcssPlugin({ inject: false, extract: true, syntax: postcssLess }),
    svelte({
      dev: !production,
      preprocess,
      emitCss: true,
    }),
    string({ include: 'src/**/*.svg' }),
    // babel({
    //   exclude: 'node_modules/**',
    // }),
    // typescript({ lib: ["es5", "es6", "dom"], target: 'es5' }),
    filesize(),
    // rollupAnalyzer({ limit: 5 }),
  ],
};

export default [
  merge({}, config, {
    plugins: [
      process.env.DEV ? serve({
        open: false,
        contentBase: ['test', 'dist'],
        port: 10002,
      }) : undefined,
      process.env.DEV ? livereload({
        watch: ['dist'],
      }) : undefined,
    ],
  }),
  // Minified version
  // production && merge({}, config, {
  //   output: {
  //     file: `dist/index.min.js`,
  //   },
  //   plugins: [
  //     terser({ sourcemap: true }),
  //   ],
  // }) || null,
  // // Module
  // production && merge({}, config, {
  //   // NOTE: this externalizes leader-line, which won't work because it exports a global variable that has to be loaded with a special loader
  //   // external: Object.keys(pkg.dependencies).concat(['path-svg/svg-path']),
  //   external: [
  //     'lodash',
  //     'raf',
  //   ],
  //   output: {
  //     file: pkg.module,
  //     format: 'es',
  //   },
  // }) || null,
];
