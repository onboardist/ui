<button ref:el class="action-btn" on:click tabindex="0" aria-label={type === 'next' ? 'Next' : 'Close'}>
  {#if type === 'next'}
    <svg xmlns="http://www.w3.org/2000/svg" class="next-button">
      <g transform="scale(0.065), translate(140, 170)">
        <use xlink:href="#right-arrow"></use>
      </g>
    </svg>
  {:else}
    {icon}
  {/if}
</button>

<style lang="less">
@import 'src/main';

@color: #fff;
@buttonSize: 56px;
@buttonBorderSize: 3px;

.action-btn {
  background: none;
  z-index: @zindex + 3;
  border-radius: 50%;
  border: @buttonBorderSize solid @color;
  height: 56px;
  width: 56px;
  position: fixed;
  top: 0;
  right: 0;
  color: @color;
  margin: 5vmin;
  font-size: @buttonSize - 20px;
  line-height: 58px; // floor(@buttonSize - (@buttonBorderSize * 2 * .75));
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 2px 0 rgba(255, 255, 255, 0.12), 0 1px 5px 0 rgba(255, 255, 255, 0.12), 0 3px 1px -2px rgba(255, 255, 255, 0.2);
  font-family: sans-serif;
}

.next-button {
  use {
    fill: #fff;
  }
}
</style>

<script>
export default {
  data() {
    return {
      // type: 'close',
      icon: 'X',
      // coachmark: null,
      // flow: null,
    }
  },
  oncreate() {
    this.refs.el.focus();
  },
  // methods: {
  //   handleClick() {
  //     const coachmark = this.get().coachmark;
  //     if (!coachmark) {
  //       console.error('No coachmark specified for action button');
  //       return;
  //     }

  //     let flow = cache('flow');
  //     if (coachmark.flow) flow = cache.set('flow', coachmark.flow);

  //     if (flow) {
  //       const next = flow.getNext(coachmark.name);
  //       if (next) {
  //         this.type = 'next';
  //         return this.fire('next', { next });
  //       } else cache.remove('flow');
  //     }

  //     this.clear();
  //   },
  //   clear() {
  //     this.fire('clear');
  //   },
  // }
}
</script>
