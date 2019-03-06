const debounce = require('lodash/debounce');

// Set up LiveReload server
const liveReloadServer = require('tiny-lr')();
liveReloadServer.listen(35729, function () {
    console.log('LiveReload listening on %s ...', 35729);
});

const debouncedChanged = debounce((event, path) => {
  console.log(`${event} ${path}`);
  liveReloadServer.changed({body: { files: [path] }});
}, 1000);

const path = require('path');
const chokidar = require('chokidar');
const wp = path.resolve(path.join(__dirname, '../../dist/onboardist-ui.umd.js'));
chokidar.watch(wp)
  .on('all', (event, path) => {
    debouncedChanged(event, path);
  });

console.log(`Watching ${wp}...`);