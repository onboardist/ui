# Tooltip

<div class="example">
  <button id="tooltip-button">button</button>
</div>

# API

## Options

<!-- * *highlight:* outline the target element to draw attention to it.
  * Allowed options:
    * `true`: use default highlight
    * `'glow'`: surround element with a glowing border
    * `'border'`: surround element with a solid colored border -->

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
      this.destroyables.push(new Onboardist.UI.Tooltip({
        attach: document.querySelector('#tooltip-button'),
        title: 'Title',
        placement: 'right',
        content: 'This is the content',
        buttons: ['ok'],
      }));

    //   this.destroyables.push(new Onboardist.UI.Tooltip({
    //     attach: '#pulse',
    //     style: 'pulse',
    //     ...popperArgs,
    //   }));

    //   this.destroyables.push(new Onboardist.UI.Tooltip({
    //     attach: '#teardrop',
    //     style: 'teardrop',
    //     ...popperArgs,
    //   }));
    },
    destroyed() {
      this.destroyables.forEach(x => x.destroy());
    },
  }
</script>