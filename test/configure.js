import test from 'ava';

const Onboardist = require('../dist/onboardist-ui.cjs');

test('configure - can register components', t => {
  Onboardist.configure({
    components: [{
      name: 'foo',
      component: 'modal',
      content: 'Foo bar',
    }],
  });

  t.truthy(Onboardist.components.foo);
  t.is(Onboardist.components.foo.args.name, 'foo');
});

