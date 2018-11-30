// Set up LiveReload server
const liveReloadServer = require('tiny-lr')();
liveReloadServer.listen(35729, function () {
    console.log('LiveReload listening on %s ...', 35729);
});

const path = require('path');
const chokidar = require('chokidar');
const wp = path.resolve(path.join(__dirname, '../../dist/**'));
chokidar.watch(wp)
  .on('all', (event, path) => {
    console.log(`${event} ${path}`);
    liveReloadServer.changed({body: { files: [path] }});
  });

console.log(`Watching ${wp}...`);