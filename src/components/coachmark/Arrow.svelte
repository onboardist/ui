<svelte:window on:resize="redraw()" on:scroll="redraw()" on:orientationchange="position()"></svelte:window>

<script>
import LeaderLine from 'leader-line';
import raf from 'raf';

const COLOR = '#fff';

export default {
  data: () => ({
    line: null,
    from: null,
    to: null,
  }),
  onstate({ current }) {
    this.redraw();
  },
  methods: {
    redraw() {
      if (this.line) this.line.remove();
      
      raf(() => {
        this.leaderLine(this.get().from, this.get().to);
      });
    },
    leaderLine(from, to) {
      // console.log(from, to, this)
      if (!from || !to) return;
      if (this.line) {
        try {
          // NOTE: this fails if we try to remove in the middle of it rendering
          this.line.remove();
        } catch (e) {
          // ...
        }
      }

      const anchorOpts = {};
  
      this.line = new LeaderLine(
        LeaderLine.areaAnchor(from, anchorOpts),
        LeaderLine.areaAnchor(to, anchorOpts),
        {
          color: COLOR,
          endPlugColor: COLOR,
          startPlugColor: COLOR,
          // endPlugSize: 0.5,
        },
      );

      this.line.path = 'fluid';
      this.line.position();

      // Put filter on lines after they've been drawn
      const lines = document.querySelectorAll('.leader-line-line-path');
      Array.prototype.forEach.call(lines, line => {
        // TODO: I've disabled the chalk roughness for now, until I can find a way to make the text rough as well
        line.setAttribute('filter', 'url(#coachmark-chalk)');
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