# Tour: Wait For Element

Sometimes you need to wait for an element to appear on the page. This example waits for the element
with selector `#foo` to be added to the page before the final scenario runs.

<div class="example">
  <button id="tour-button" @click="startTour()">Start Tour</button>
  <button id="next-button" @click="addElm()">Add Element</button>
</div>

```js
document.querySelector('#next-button')
  .addEventListener('click', () => {
    Onboardist.UI.next();
  });

this.tour = new Onboardist.UI.Tour({
  // Scenario list
  scenarios: [
    // Scenario #1
    {
      components: [{
        // One element
        component: 'modal',
        title: 'Getting Started',
        content: 'Take a quick tour of the system',
      }],
    },
    {
      wait: '#foo',
      components: [{
        component: 'modal',
        title: 'Success',
        content: 'You did it!',
      }],
    },
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
        {
          components: [{
            // One element
            component: 'modal',
            title: 'Getting Started',
            content: 'Take a quick tour of the system',
          }],
        },
        // Scenario #2
        {
          components: [{
            component: 'tooltip',
            attach: '#next-button', 
            content: 'Click this button',
            showNext: false,
            showPrev: false,
          }],
        },
        {
          wait: '#foo',
          components: [{
            component: 'modal',
            title: 'Success',
            content: 'You did it!',
            showPrev: false,
          }],
        },
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
      this.removeFoo();
      this.tour.start();
    },
    removeFoo() {
      const foos = document.querySelectorAll('#foo');
      if (foos && foos.length > 0) {
        foos.forEach(x => x.remove());
      }
    },
    addElm() {
      this.removeFoo();

      const div = document.createElement('div');
      div.setAttribute('id', 'foo');
      div.innerText = 'foo';
      document.querySelector('.example').appendChild(div);
    }
  },
};
</script>

<style>
#foo {
  padding: 20px 40px;
  text-transform: uppercase;
  background-color: blue;
  color: white;
  border: 1px dashed gray;
  margin: 20px;
  font-weight: bold;
  border-radius: 4px;
}
</style>