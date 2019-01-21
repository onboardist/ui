// Tests for main API
import test from 'ava';

const mockBrowser = require('../helpers/setup-browser-env');
const Onboardist = require('../../dist/onboardist-ui.cjs');

test.afterEach(() => {
  Onboardist.reset();
  mockBrowser();
});

test.serial('Can create a component', async t => {
  const tooltip = new Onboardist.Tooltip({
    attach: 'body',
    title: 'Create New User',
    content: 'Click to create new user',
  });

  // Gotta allow for wait-for-element which is async
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 100);
  });

  t.truthy(document.body.querySelector('.tooltip'));
});

test.serial('Can attach component to DOM element (body)', t => {
  const tooltip = new Onboardist.Tooltip({
    attach: document.body,
    title: 'Create New User',
    content: 'Click to create new user',
  });

  t.truthy(document.body.querySelector('.tooltip'));
});

test.serial('close() destroys component', t => {
  const tooltip = new Onboardist.Tooltip({
    attach: document.body,
    title: 'Create New User',
    content: 'Click to create new user',
  });

  tooltip.close();

  t.falsy(document.body.querySelector('.tooltip'));
});

test.serial('can register and trigger component DOM events', t => {
  let foo = 'foo';

  const tooltip = new Onboardist.Tooltip({
    attach: document.body,
    title: 'Create New User',
    content: 'Click to create new user',
    events: {
      click: () => foo = 'bar',
    },
  });

  document.body.querySelector('.tooltip').click();

  t.is('bar', foo);
});

test.serial('destroying component destroys element and thus handlers', t => {
  const tooltip = new Onboardist.Tooltip({
    attach: document.body,
    title: 'Create New User',
    content: 'Click to create new user',
    events: {
      click: () => {},
    },
  });

  tooltip.destroy();

  t.falsy(tooltip.refs.el);
});

test.serial('can register component for global events', t => {
  let foo = 'foo';

  const tooltip = new Onboardist.Tooltip({
    attach: document.body,
    title: 'Create New User',
    content: 'Click to create new user',
    events: {
      'main.event': () => foo = 'bar',
    },
  });

  Onboardist.fire('main.event');

  t.is('bar', foo);
});

test.serial("can bind component 'show' event", t => {
  Onboardist.configure({
    components: [{
      name: 'tooltip1',
      component: 'tooltip',
      args: {
        attach: document.body,
        title: 'Create New User',
        content: 'Click to create new user',
        events: {
          'main.event': 'show',
        },
      },
    }],
  });

  t.falsy(document.body.querySelector('.tooltip'));

  Onboardist.fire('main.event');

  t.truthy(document.body.querySelector('.tooltip'));
});
