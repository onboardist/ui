import test from 'ava';

const Onboardist = require('../dist/onboardist-ui.cjs');

test('Can create new tour', t => {
  const scenarios = [
    {
      components: [],
    },
  ];

  const tour = new Onboardist.Tour({
    name: 'new-user',
    scenarios,
  });

  t.is('new-user', tour.options.name);
  t.is(scenarios, tour.scenarios);
});

test('Tours require scenarios', t => {
  t.throws(() => {
    const tour = new Onboardist.Tour();
  });

  t.throws(() => {
    const tour = new Onboardist.Tour({ scenarios: '' });
  });

  t.throws(() => {
    const tour = new Onboardist.Tour({ scenarios: [] });
  });
});

test('If tour has no components it throws', t => {
  t.throws(() => {
    const tour = new Onboardist.Tour({
      scenarios: [
        {},
      ],
    });
  });
});

test('Tour components get registered', t => {
  const tour = new Onboardist.Tour({
    scenarios: [
      {
        components: [
          { name: 'tip1', component: 'tooltip' },
          { name: 'tip2', component: 'tooltip' },
        ],
      },
    ],
  });

  t.truthy(Onboardist.Registry.component('tip1'));
  t.truthy(Onboardist.Registry.component('tip2'));
});

test('Can start a tour', t => {
  Onboardist.configure({
    tours: [
      {
        name: 'new-user',
        scenarios: [{ components: [{ component: 'tooltip' }] }],
      },
      {
        name: 'new-company',
        scenarios: [{ components: [{ component: 'tooltip' }] }],
      },
    ],
  });

  Onboardist.start('new-user');

  t.is('new-user', Onboardist.Registry.activeTour().name);
});
