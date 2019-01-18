import test from 'ava';

const Onboardist = require('../dist/onboardist-ui.cjs');

test.beforeEach('Reset UI listeners', () => {
  Onboardist.reset();
});

test('on() returns working dereg function', t => {
  let toggle = false;
  const foo = () => toggle = true;
  const dereg = Onboardist.on('foo', foo);

  t.is(typeof dereg, 'function');

  dereg();

  Onboardist.fire('foo');

  // Listeners is cleared out if no elements are left in array
  t.is(false, toggle);
});

test('fire() triggers handlers', t => {
  let bar = 'baz';
  let bar2 = 'baz';
  const foo = () => bar = 'buzz';
  const foo2 = () => bar2 = 'buzz';
  Onboardist.on('foo', foo);
  Onboardist.on('foo', foo2);

  Onboardist.fire('foo');

  t.is(bar, 'buzz');
  t.is(bar2, 'buzz');
});

test('fire() passes arguments', t => {
  let shown = false;
  Onboardist.on('show-user', val => {
    shown = val;
  });

  Onboardist.fire('show-user', 'ok');

  t.is('ok', shown);
});
