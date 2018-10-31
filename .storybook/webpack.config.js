const less = require('less');

module.exports = (config) => {
  // Find svelte loader from svele storybook plugin and add lesscss preprocessing
  const svelte = config.module.rules.find(x => x.loader && ~x.loader.indexOf('svelte'));
  
  svelte.options.preprocess = {
    style: ({ content, attributes }) => {
      if (attributes.lang !== 'less') return;

      return less.render(content)
      .then(output => ({ code: output.css, map: output.map }));
    },
  };

  // Return the altered config
  return config;
};