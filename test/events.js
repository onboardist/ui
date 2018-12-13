import test from 'ava';
const UI = require('../dist');

test.beforeEach('Reset UI listeners', () => {
  UI.reset();
});

test('Registering for events adds listener', t => {
  const foo = () => {};
  UI.on('foo', foo);

  t.is(UI.listeners['foo'][0], foo);
});

test('on() returns working dereg function', t => {
  const foo = () => {};
  const dereg = UI.on('foo', foo);

  t.is(typeof(dereg), 'function');

  dereg();

  // Listeners is cleared out if no elements are left in array
  t.falsy(UI.listeners['foo']);
});

test('fire() triggers handlers', t => {
  let bar = 'baz';
  let bar2 = 'baz';
  const foo = () => bar = 'buzz';
  const foo2 = () => bar2 = 'buzz';
  UI.on('foo', foo);
  UI.on('foo', foo2);

  UI.fire('foo');

  t.is(bar, 'buzz');
  t.is(bar2, 'buzz');
});