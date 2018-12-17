# Onboardist Events

<br>
<div class="example">
  <button id="tooltip-button" @click="fireEvent()">click</button>
</div>

```js
document.querySelector('#tooltip-button').addEventListener('click', () => {
  Onboardist.UI.fire('custom-event');
});

Onboardist.UI.registerComponent({
  name: 'tooltip01',
  component: 'tooltip',
  args: {
    attach: '#tooltip-button',
    title: 'Hey, You Clicked!',
    content: 'Cool click, bro.',
    events: {
      'custom-event': 'show',
    },
  },
});
```

<script>
const popperArgs = {
  placement: 'left',
  modifiers: {
    offset: {
      enabled: true,
      offset: '0,-50%r',
    },
  },
};

export default {
  props: ['slot-key'],
  data: () => ({
    destroyables: [],
  }),
  methods: {
    fireEvent() {
      Onboardist.UI.fire('custom-event');
    },
  },
  mounted() {
    Onboardist.UI.registerComponent({
      name: 'tooltip01',
      component: 'tooltip',
      args: {
        attach: '#tooltip-button',
        title: 'Hey, You Clicked!',
        content: 'Cool click, bro.',
        events: {
          'custom-event': 'show',
        },
      },
    });

    // new Onboardist.UI.Hotspot({
    //   name: 'hot01',
    //   attach: '#tooltip-button',
    //   events: {
    //     'custom-event': 'tooltip01',
    //   },
    //   ...popperArgs,
    // });
  },
  destroyed() {
    Onboardist.UI.reset();
  },
};
</script>