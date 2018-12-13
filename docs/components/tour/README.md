# Tour

A tour is a special meta-component that combines multiple sub-components into a series of steps. Technically it is a
state machine. Each step in the tour is an independent state and each state defines multiple ways to transition to the
next, previous, or an arbitrary state.

Example:

1. User clicks on a help button which starts the tour. A modal opens in the middle of the screen with a "Next" button in it.
2. Clicking the next button opens a hotspot with a tooltip next to it. This also has a "Next" button
3. Clicking THAT next button opens yet another hotspot with another tooltip, etc, etc.

<div class="example">
  <button id="tour-button" @click="startTour()">Start Tour</button>
</div>

## API

The tour constructor takes an array of arrays... of arrays. Confusing, I know. But it breaks down like this:

```js
// Array of scenarios steps
[
  // Scenario 1
  [
    // Element 1
    [el, args], 
    // Element 2
    [el, args]
  ],
  // Scenario 2
  [
    // Element 3
    [el, args]
  ]
]
```

The outer array is your "scenarios", or _steps_. Each scenario has a list of elements that are shown on screen. When the user navigates to the next scenario, the screen is cleared and the new scenario's components are shown. 

Example code used for the tour on this page:

```js
const tour = new Onboardist.UI.Tour(
  // Scenario list
  [
    // First scenario, with one element
    [[
      Onboadist.UI.Modal, {
        title: 'Getting Started',
        content: 'Take a quick tour of the system',
      }),
    ]],
    // Second scenario
    [
      // Two elements
      [Onboardist.UI.Hotspot, { attach: '.links a[href="/guide/"]', name: 'hot1' }],
      ['tooltip', { attach: 'hot1', content: 'Try the guide' }],
    ],
  ],
  // Additional options for tour
  {
    showNext: true,
    showPrev: true,
  },
);

tour.start();
```

::: tip
You can either use the component name, or a simple string for the component, i.e. `'tooltip'` instead of `Onboardist.UI.Tooltip` as seen above. This makes
tour configs JSON-compatible.
:::

## Options

### showPrev

* Type: `boolean`
* Default: true
  
Show a button to navigate to the previous page. Only affects components that show buttons (Modals, Tooltips). Doesn't show on first scenario.

### showNext

* Type: `boolean`
* Default: true
  
Show a button to navigate to the next page. Only affects components that show buttons (Modals, Tooltips). On the last scenario it shows "End".



<script>
export default {
  props: ['slot-key'],
  data: () => ({
    destroyables: [],
    tour: null,
  }),
  mounted() {
    this.tour = new Onboardist.UI.Tour(
      // Scenario list
      [
        // Scenario #1
        [[
          // One element
          Onboardist.UI.Modal, {
            title: 'Getting Started',
            content: 'Take a quick tour of the system',
          },
        ]],
        // Scenario #2
        [
          // Elements
          [Onboardist.UI.Hotspot, { attach: '.links a[href="/guide/"]', name: 'hot1' }],
          [Onboardist.UI.Tooltip, { attach: 'hot1', content: 'Try the guide' }],
        ],
      ],
      {
        showNext: true,
        showPrev: true,
      },
    );

    // this.destroyables.push(this.tour);
  },
  destroyed() {
    this.tour.clear();
    // this.destroyables.forEach(x => x.destroy());
  },
  methods: {
    startTour() {
      this.tour.start();
    },
  },
};
</script>