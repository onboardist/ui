const deasync = require('deasync');
const { compile } = require('./compile');

module.exports.process = (_s, filePath, _c, _o) => {
  let code, map;
  compile(filePath, 'App', {}).then(comp => {
    code = comp.code;
    map = comp.map;
  });

  deasync.loopWhile(() => !code && !map);

  return { code, map };
};
