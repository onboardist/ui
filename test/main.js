// Tests for main API
import test from 'ava';

const Onboardist = require('../dist/onboardist-ui.cjs');

test('Can retrieve a component from the registry by name', t => {
  Onboardist.configure({
    components: [{
      component: 'tooltip',
      name: 'new-user-modal',
    }],
  });

  t.truthy(Onboardist.component('new-user-modal'));
});

test('Can retrieve a tour from the registry by name', t => {
  Onboardist.configure({
    tours: [{
      name: 'new-user',
    }],
  });

  t.truthy(Onboardist.tour('new-user'));
});

test('Can set/get active tour', t => {
  Onboardist.configure({
    tours: [
      {
        name: 'new-user',
      },
      {
        name: 'new-company',
      },
    ],
  });

  const tour = Onboardist.tours['new-user'];

  Onboardist.setActiveTour(tour);

  t.is(tour, Onboardist.activeTour());
});
