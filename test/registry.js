import test from 'ava';

const Onboardist = require('../dist/onboardist-ui.cjs');

test.beforeEach(() => {
  Onboardist.reset();
});

test('Can register a component', t => {
  Onboardist.Registry.registerComponent({ name: 'foo', component: 'tooltip' });

  t.is('foo', Onboardist.Registry.component('foo').args.name);
});

test('Registration of component with name generates unique name', t => {
  const comp = Onboardist.Registry.registerComponent({ component: 'tooltip' });

  t.truthy(comp.args.name);
  t.truthy(Onboardist.Registry.component(comp.args.name));
});

test('Can register tour', t => {
  const tour = Onboardist.Registry.registerTour({ scenarios: [{ components: { component: 'modal' } }] });

  t.truthy(tour.name);
});

test('Can set active tour', t => {
  const tour1 = {
    name: 'tour1',
    scenarios: [
      {
        components: [{ component: 'tooltip', content: 'Testing' }],
      },
    ],
  };
  Onboardist.Registry.registerTour(tour1);

  Onboardist.Registry.setActiveTour(tour1);
  const activeTour = Onboardist.Registry.activeTour();

  t.is(tour1, activeTour);
});

test('Can set active tour by name', t => {
  Onboardist.Registry.registerTour({
    name: 'tour1',
    scenarios: [
      {
        components: [{ component: 'tooltip', content: 'Testing' }],
      },
    ],
  });

  Onboardist.Registry.setActiveTour('tour1');
  const tour = Onboardist.Registry.activeTour();

  t.is('tour1', tour.name);
});

test('Activating non-existing tour throws error', t => {
  t.throws(() => {
    Onboardist.Registry.setActiveTour('foo');
  });

  t.throws(() => {
    Onboardist.Registry.setActiveTour();
  });
});

test('Can register component instance', t => {
  const comp = Onboardist.Registry.registerComponent({ component: 'tooltip' });

  const instance = new comp.component(comp.args);

  Onboardist.Registry.registerInstance({ name: comp.args.name, instance });

  t.is(instance, Onboardist.Registry.component(comp.args.name).instance);
});

test('Must pass name to registerInstance()', t => {
  t.throws(() => {
    Onboardist.Registry.registerInstance({ instance: {} });
  });
});

test('Must pass instance to registerInstance()', t => {
  const comp = Onboardist.Registry.registerComponent({ component: 'tooltip' });

  t.throws(() => {
    Onboardist.Registry.registerInstance({ name: comp.args.name });
  });
});

test('Can deregister component instance', t => {
  const comp = Onboardist.Registry.registerComponent({ component: 'tooltip' });

  const instance = new comp.component(comp.args);

  Onboardist.Registry.registerInstance({ name: comp.args.name, instance });
  Onboardist.Registry.deregisterInstance(comp.args.name);

  t.falsy(Onboardist.Registry.component(comp.args.name).instance);
});

test('destroyInstances() destroys all component instances', t => {
  let i = 5;
  while (i--) {
    const comp = Onboardist.Registry.registerComponent({ component: 'tooltip', name: `comp-${i}` });
    const instance = new comp.component(comp.args);
    Onboardist.Registry.registerInstance({ name: comp.args.name, instance });
  }

  Onboardist.Registry.destroyInstances();

  i = 5;
  while (i--) {
    t.falsy(Onboardist.Registry.component(`comp-${i}`).instance);
  }

  t.falsy(document.body.querySelector('.tooltip'));
});
