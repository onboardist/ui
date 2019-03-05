# Coachmark

Coachmarks are hand-sketched-looking drawings that overlay on top of your UI to explain different pieces. They are often used for progressive and mobile apps where there is not enough screen real estate for things like modals and hotspots to make sense.

:::tip Coming Soon
The coachmark component will be coming soon.
:::

<div class="example">
  <button id="coachmark-demo">button</button>
</div>

<script>
export default {
  props: ['slot-key'],
  mounted() {
    new Onboardist.UI.Coachmark({
      attach: '#coachmark-demo',
      content: 'Testing coachmarks',
    });
  },
};
</script>