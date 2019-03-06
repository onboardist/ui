# Coachmark

Coachmarks are hand-sketched-looking drawings that overlay on top of your UI to explain different pieces. They are often used for progressive and mobile apps where there is not enough screen real estate for things like modals and hotspots to make sense.

:::tip Alpha
The coachmark component is still in alpha state. Use at your own risk!
:::

<div class="example">
  <button id="coachmark-demo" @click="showCoachmark()">button</button>
</div>

<script>
export default {
  props: ['slot-key'],
  data: () => ({
    mark: null,
  }),
  mounted() {
  },
  methods: {
    showCoachmark() {
      this.mark = new Onboardist.UI.Coachmark({
        attach: '#coachmark-demo',
        content: 'This is a coachmark',
      });
    },
  },
  destroyed() {
    Onboardist.UI.reset();
  },
};
</script>