# Events

## `click`

<br>
<div class="example">
  <div id="pulse" class="style-demo"></div>
</div>

```js
const h = new Onboardist.UI.Hotspot({
  attach: '#pulse',
  events: {
    click: () => { alert('Foo!'); },
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
  mounted() {
    this.destroyables.push(new Onboardist.UI.Hotspot({
      attach: '#pulse',
      events: {
        click: () => { alert('Foo!'); },
      },
      ...popperArgs,
    }));
  },
  destroyed() {
    this.destroyables.forEach(x => x.destroy());
  },
};
</script>