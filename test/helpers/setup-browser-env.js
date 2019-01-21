const fs = require('fs');
const path = require('path');
const browserEnv = require('browser-env');

function mockBrowser() {
  browserEnv();

  if (global.document) {
    document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      },
    });
  }

  global.cancelAnimationFrame = () => {};

  // Mock MutationObserver so wait-for-the-element works
  const mo = fs.readFileSync(
    path.resolve('node_modules', 'mutationobserver-shim', 'dist', 'mutationobserver.min.js'),
    { encoding: 'utf-8' },
  );
  const moScript = window.document.createElement('script');
  moScript.textContent = mo;

  window.document.body.appendChild(moScript);
}

mockBrowser();

module.exports = mockBrowser;
