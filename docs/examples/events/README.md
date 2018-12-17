# Events

## `click`

<br>
<div class="example">
  <div id="click-demo" class="style-demo"></div>
</div>

```js
const h = new Onboardist.UI.Hotspot({
  attach: '#click-demo',
  events: {
    click: () => {
      // Don't do this lol
      alert('Foo!');
    },
  },
});
```

## `mouseover` / `mouseout`

<br>
<div class="example">
  <div id="mouseover" class="style-demo"></div>
</div>

```js
Onboardist.UI.registerComponent({
  name: 'tooltip01',
  component: 'tooltip',
  args: {
    attach: 'hot1',
    title: 'Tooltip Title',
    content: 'Tooltip content',
    buttons: false,
  },
});
this.destroyables.push(new Onboardist.UI.Hotspot({
  attach: '#mouseover',
  events: {
    mouseover: 'tooltip01',
    mouseout: 'tooltip01.hide',
  },
}));
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
      attach: '#click-demo',
      events: {
        click: () => { alert('Foo!'); },
      },
      ...popperArgs,
    }));

    Onboardist.UI.registerComponent({
      name: 'tooltip01',
      component: 'tooltip',
      args: {
        attach: 'hot1',
        title: 'Tooltip Title',
        content: 'Tooltip content',
        buttons: false,
      },
    });
    this.destroyables.push(new Onboardist.UI.Hotspot({
      name: 'hot1',
      attach: '#mouseover',
      events: {
        mouseover: 'tooltip01.show',
        mouseout: 'tooltip01.hide',
      },
      ...popperArgs,
    }));
  },
  destroyed() {
    this.destroyables.forEach(x => x.destroy());
    Onboardist.UI.reset();
  },
};
</script>