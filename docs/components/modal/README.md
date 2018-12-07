# Modal

<div class="example">
  <div id="example-target"></div>
  <br>
  <button type="button" class="pull-left" @click="openModal()">Open Modal</button>
</div>

# Usage

```js
const modal = new ..Modal({
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
      // this.destroyables.push(new Onboardist.UI.Modal({
      //   attach: document.querySelector('#example-target'),
      //   title: 'Title',
      //   placement: 'right',
      //   content: 'This is the content'
      // }));
      const i = new Onboardist.UI.ModalComponent({
        target: document.querySelector('#example-target'),
        data: {
          title: 'Create Modals',
          content: `
            You can create modals with different types of buttons.
            <br><br>
            They can also contain <b><i>HTML</b></i>.
            <br><br>
            By default, they have an 'OK' button that will close the modal.
          `,
          buttons: null,
        },
      })
    },
    destroyed() {
      this.destroyables.forEach(x => x.destroy());
    },
    methods: {
      openModal() {
        new Onboardist.UI.Modal({
          title: 'This is a modal',
          content: `I'm here in ur body.`,
        });
      },
    }
  }
</script>

<style>
.example .oboardist-modal {
  background: none !important;
}

.example .oboardist-modal, .example .oboardist-modal .box {
  position: relative !important;
}
</style>