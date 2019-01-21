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

// test('Can start a tour', t => {
//   Onboardist.configure({
//     tours: [
//       {
//         name: 'new-user',
//       },
//       {
//         name: 'new-company',
//       },
//     ],
//   });

//   const tour = Onboardist.Registry.tour('new-user');
//   console.log(tour.start);
//   tour.start();

//   t.is(tour, Onboardist.Registry.activeTour());
// });
