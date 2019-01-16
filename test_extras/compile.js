const rollup = require('rollup');
const esm = require('esm');

const config = esm(module)('../rollup.config').default;

function generateOptions(filePath, name) {
  return {
    input: { input: filePath, plugins: config[0].plugins },
    output: {
      file: `./dist/test/${name}.js`,
      format: 'cjs',
    },
  };
}

function compile(filePath, name) {
  const { input, output } = generateOptions(filePath, name);

  return rollup.rollup(input)
    .then(bundle => {
      return bundle.generate(output);
    })
    .then(({ code, map }) => {
      return { code, map };
    });
}

module.exports = { compile };
