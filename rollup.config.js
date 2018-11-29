import { merge } from 'lodash';
// import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import getPreprocessor from 'svelte-preprocess';
import glob from 'glob-all';
import legacy from 'rollup-plugin-legacy';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
// import less from 'less';
import path from 'path';
// import postcss from 'postcss';
// import postcssLess from 'postcss-less';
import postcssPlugin from 'rollup-plugin-postcss';
import purgecss from 'rollup-plugin-purgecss';
import serve from 'rollup-plugin-serve';
import string from 'rollup-plugin-string';
import svelte from 'rollup-plugin-svelte';
import tailwindcss from 'tailwindcss';
import { terser } from 'rollup-plugin-terser';
// import typescript from 'rollup-plugin-typescript';
import * as ts from 'typescript';
// import rollupAnalyzer from 'rollup-analyzer-plugin';
import { minify } from 'uglify-es';
import pkg from './package.json';

const production = process.env.NODE_ENV === 'production';

const preprocess = getPreprocessor({
	transformers: {
    postcss: true,
    less: true,
  },
});

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
  }
}

const config = {
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
    // sass({
    //   insert: true,
    // }),
    postcssPlugin(),
    svelte({
      preprocess,
      // preprocess: {
      //   style: ({ content, attributes }) => {
      //     if (attributes.lang !== 'less') return;

      //     return postcss([
      //       // require('postcss-import'),
      //       require('postcss-cssnext'),
      //       tailwindcss('./tailwind.js'),
      //     ])
      //     .process(content, { syntax: postcssLess, from: 'src' })
      //     .then(result => less.render(result.content))
      //     .then(output => ({ code: output.css, map: output.map }));
      //   },
      //   script: ({ content, attributes }) => {
      //     if (attributes.lang !== 'ts') return;

      //     const output = ts.transpileModule(content, {})
      //     console.log(JSON.stringify(output.outputText));
          
      //     return { code: output.outputText, map: output.sourceMapText };
      //   },
      // },
    }),
    string({ include: 'src/**/*.svg' }),
    {
      transform ( code, id ) {
        console.log('id', id );
        // console.log( code );
        // not returning anything, so doesn't affect bundle
      }
    },
    purgecss({
      include: '**/*.css',
      content: [
        // path.join(__dirname, "src/**/*.js"),
        // path.join(__dirname, "src/**/*.svelte"),
        'src/**/*.svelte',
      ],
      output: (css, styles) => {
        console.log(css, styles);
      }
      // extractors: [
      //   {
      //     extractor: TailwindExtractor,

      //     // Specify the file extensions to include when scanning for
      //     // class names.
      //     extensions: ["js", "svelte"],
      //   },
      // ],
    }),
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
