# Modal

<div class="example">
  <div id="example-target"></div>
  <br>
  <button type="button" class="pull-left" @click="openModal()">Open Modal</button>
</div>

## Usage

```js
const modal = new Onboardist.UI.Modal({
  title: 'This is a modal',
  content: 'This is the content',
}));
```

## Options

!!!include(name.md)!!!

### backdrop

* Type: `boolean`
* Default: `true`

Put a backdrop over the screen beneath the component

!!!include(buttons.md)!!!

### title

* Type: `string`
* Default: `undefined`

Displays a title row across the top of the modal. If not set there will be no title row.

### content

* Type: `string`
* Default: `undefined`

Content to put in the body of the modal. You can use html.

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
          backdrop: false,
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
          content: `This is the content`,
        });
      },
    }
  }
</script>

<style>
.example .oboardist-container {
  background: none !important;
}

.example .oboardist-container, .example .oboardist-container .box {
  position: relative !important;
}
</style>