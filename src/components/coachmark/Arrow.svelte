<svelte:window on:resize="redraw()"></svelte:window>

<script>
import LeaderLine from 'leader-line';

const COLOR = '#fff';

export default {
  data: () => ({
    line: {},
    from: null,
    to: null,
  }),
  onstate({ current }) {
    this.redraw();
  },
  methods: {
    redraw() {
      if (this.line) this.line.remove();
      this.leaderLine(this.get().from, this.get().to);
    },
    leaderLine(from, to) {
      // console.log(from, to, this)
      if (!from || !to) return;
  
      this.line = new LeaderLine(
        LeaderLine.areaAnchor(from),
        LeaderLine.areaAnchor(to),
        {
          color: COLOR,
          endPlugColor: COLOR,
          startPlugColor: COLOR,
          // endPlugSize: 0.5,
        },
      );

      this.line.path = 'magnet';
      this.line.position();

      // Put filter on lines after they've been drawn
      const lines = document.querySelectorAll('.leader-line-line-path');
      Array.prototype.forEach.call(lines, line => {
        // TODO: I've disabled the chalk roughness for now, until I can find a way to make the text rough as well
        // line.setAttribute('filter', 'url(#coachmark-chalk)');
      });
    }
  },
  ondestroy() {
    if (this.line) this.line.remove();
  },
};
</script>

<style lang="less">
@import 'src/main';

:global(.leader-line) {
  z-index: @zindex + 3;
}
</style>