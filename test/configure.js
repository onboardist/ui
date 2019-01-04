import test from 'ava';

const UI = require('../dist');

test('configure - can register components', t => {
  UI.configure({
    components: [{
      name: 'foo',
      component: 'modal',
      content: 'Foo bar',
    }],
  });

  t.truthy(UI.components.foo);
  t.is(UI.components.foo.args.name, 'foo');
});

// test('configure - can register tours', t => {
  
// });
