<div ref:el class="oboardist-modal">
  <Box ref:box title={title}>
    <div slot="content">{@html content}</div>
    <div slot="buttons">
      {#if buttons}
        {#each buttons as button}
          <button type="button" class="onboardist-button" on:click="call(button.handler)">{button.text}</button>
        {/each}
      {/if}
    </div>
  </Box>
</div>

<script>
import Box from './Box.svelte';
import { close, oncreate, ondestroy, expandButtonArgs, hide, show } from '../methods';

export default {
  oncreate() {
    if (this.get().buttons) this.set({ buttons: expandButtonArgs(this.get().buttons) });

    return oncreate.call(this);
  },
  ondestroy,
  components: { Box },
  data() {
    return {
      title: '',
      buttons: ['ok'],
      content: '',
    };
  },
  methods: {
    close,
    show,
    hide,
    call(fn, ...args) {
      fn.call(this, ...args);
    },
  }
};
</script>

<style lang="less">
@import 'src/main';

.oboardist-modal {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: @zindex;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

:global(.oboardist-modal .box) {
  border: none !important;
  z-index: @zindex+1;
  box-shadow: 0 0 50px 10px rgba(0, 0, 0, 0.2) !important;

  .positioned {
    /* position: absolute;
    margin: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0; */
  }
}
</style>