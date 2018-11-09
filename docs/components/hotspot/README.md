# Hotspot

A hotspot is a widget that draws attention to an area of the screen. Often they use animation and colors to draw the eye. Here's an example:

<div class="example">
  <button id="hotspot-button">button</button>
</div>

# Styles

<div class="styles">
  <Card>
    <h4>Pulse</h4>
    <div id="pulse" class="style-demo"></div>
  </Card>
  <Card>
    <h4>Teardrop</h4>
    <div id="teardrop" class="style-demo"></div>
  </Card>
</div>

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
      this.destroyables.push(new OnboardistUI.Hotspot({
        attach: document.querySelector('#hotspot-button'),
        placement: 'top-end',
      }));

      this.destroyables.push(new OnboardistUI.Hotspot({
        attach: '#pulse',
        style: 'pulse',
        ...popperArgs,
      }));

      this.destroyables.push(new OnboardistUI.Hotspot({
        attach: '#teardrop',
        style: 'teardrop',
        ...popperArgs,
      }));
    },
    destroyed() {
      this.destroyables.forEach(x => x.destroy());
    },
  }
</script>
<style lang="less">
.styles {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;

  .md-card, .md-card .card-content {
    text-align: center;
  }
}

.style-demo {
  width: 50px;
  height: 50px;
  display: inline-block;
}
</style>