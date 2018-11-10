# Modal

<div class="example">
  <div id="example-target"></div>
</div>

# Usage

```js
const modal = new OnboardistUI.Modal({
  attach: '.my-element',
  title: 'Title',
  content: 'This is the content',
}));
```

<script>
  export default {
    props: ['slot-key'],
    data: () => ({
      destroyables: [],
    }),
    mounted() {
      // this.destroyables.push(new OnboardistUI.Modal({
      //   attach: document.querySelector('#example-target'),
      //   title: 'Title',
      //   placement: 'right',
      //   content: 'This is the content'
      // }));
      const i = new OnboardistUI.ModalComponent({
        target: document.querySelector('#example-target'),
        data: {
          title: 'Title',
          content: 'This is the content',
        },
      })
    },
    destroyed() {
      this.destroyables.forEach(x => x.destroy());
    },
  }
</script>