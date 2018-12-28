# Tour: Hide Next Button

Sometimes you want to hide the "Next" button on a component in a tour, if the next stage is triggered by your app.

<div class="example">
  <button id="tour-button" @click="startTour()">Start Tour</button>
  <button id="next-button" @click="next()">Next Step</button>
</div>

```js
this.tour = new Onboardist.UI.Tour({
  // Scenario list
  scenarios: [
    // Scenario #1
    [[
      // One element
      'modal', {
        title: 'Getting Started',
        content: 'Take a quick tour of the system',
      },
    ]],
    // Scenario #2
    [
      // Elements
      ['tooltip', {
        attach: '#next-button', 
        content: 'Click this button',
        showNext: false,
        showPrev: false,
      }],
    ],
    [
      ['modal', { content: 'You did it!' }],
    ],
  ],
  showNext: true,
  showPrev: true,
});
```

<script>
export default {
  props: ['slot-key'],
  data: () => ({
    destroyables: [],
    tour: null,
  }),
  mounted() {
    this.tour = new Onboardist.UI.Tour({
      // Scenario list
      scenarios: [
        // Scenario #1
        [[
          // One element
          'modal', {
            title: 'Getting Started',
            content: 'Take a quick tour of the system',
          },
        ]],
        // Scenario #2
        [
          // Elements
          [Onboardist.UI.Tooltip, {
            attach: '#next-button', 
            content: 'Click this button',
            showNext: false,
            showPrev: false,
          }],
        ],
        [
          ['modal', { content: 'You did it!' }],
        ],
      ],
      showNext: true,
      showPrev: true,
    });
  },
  destroyed() {
    Onboardist.UI.reset();
  },
  methods: {
    startTour() {
      this.tour.start();
    },
    next() {
      Onboardist.UI.next();
    }
  },
};
</script>