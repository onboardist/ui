# Tooltip

<div class="example">
  <button id="tooltip-button" @click="showTip()">button</button>
</div>

## Usage

```js
const tooltip = new Onboardist.UI.Tooltip({
  attach: document.querySelector('#tooltip-button'),
  title: 'Title',
  placement: 'right',
  content: 'This is the content',
  buttons: ['ok'],
}));
```

## Options

!!!include(attach.md)!!!

```js
new Tooltip({ attach: 'input.my-input-class' });

new Tooltip({ attach: document.querySelector('input.my-input-class') });
```

!!!include(backdrop.md)!!!

!!!include(buttons.md)!!!

!!!include(name.md)!!!

!!!include(placement.md)!!!

<!-- * *highlight:* outline the target element to draw attention to it.
  * Allowed options:
    * `true`: use default highlight
    * `'glow'`: surround element with a glowing border
    * `'border'`: surround element with a solid colored border -->

<script>
  export default {
    props: ['slot-key'],
    data: () => ({
      destroyables: [],
    }),
    mounted() {
      Onboardist.UI.configure({
        components: [
          {
            component: 'tooltip',
            name: 'demo-tip',
            args: {
              attach: '#tooltip-button',
              // placement: 'right',
              content: 'This is the content',
              buttons: ['ok'],
              events: {
                'show-tip': 'show',
              },
            },
          },
        ],
      });
      Onboardist.UI.fire('show-tip');
    },
    methods: {
      showTip() {
        Onboardist.UI.fire('show-tip');
      }
    },
    destroyed() {
      Onboardist.UI.reset()
    },
  }
</script>