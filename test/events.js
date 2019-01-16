import test from 'ava';

const Onboardist = require('../dist/onboardist-ui.cjs');

test.beforeEach('Reset UI listeners', () => {
  Onboardist.reset();
});

test('Registering for events adds listener', t => {
  const foo = () => {};
  Onboardist.on('foo', foo);

  t.is(Onboardist.listeners.foo[0], foo);
});

test('on() returns working dereg function', t => {
  const foo = () => {};
  const dereg = Onboardist.on('foo', foo);

  t.is(typeof dereg, 'function');

  dereg();

  // Listeners is cleared out if no elements are left in array
  t.falsy(Onboardist.listeners.foo);
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
