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

  t.truthy(Onboardist.Registry.getComponent('foo'));
  t.is(Onboardist.Registry.getComponent('foo').args.name, 'foo');
});

