<svelte:window on:keydown="keypress(event)"/>
<div ref:el class="oboardist-container modal"
  role="alertdialog"
  aria-modal="true"
  aria-label={title || content}
  aria-describedby="coachmark-modal-content-{id}"
>
  <Box ref:box title={title}>
    <div id="coachmark-modal-content-{id}" slot="content">{@html content}</div>
    <div slot="buttons">
      {#if buttons}
        {#each buttons as button}
          <button type="button" tabindex="0" class="onboardist-button" on:click="call(button.handler)">{button.text}</button>
        {/each}
      {:else}
        &nbsp;
      {/if}
    </div>
  </Box>
</div>
{#if backdrop}
  <div class:backdrop="backdrop"></div>
{/if}

<script>
import { uniquestring } from '../util';
import Box from './Box.svelte';
import { close, oncreate, ondestroy, expandButtonArgs } from '../methods';

export default {
  oncreate() {
    if (this.get().buttons) this.set({ buttons: expandButtonArgs(this.get().buttons) });

    // Focus first button
    const firstButton = this.refs.el.querySelector('button');
    if (firstButton) firstButton.focus();

    return oncreate.call(this);
  },
  ondestroy,
  components: { Box },
  data() {
    return {
      id: uniquestring(),
      title: '',
      buttons: ['ok'],
      content: '',
      backdrop: true,
    };
  },
  methods: {
    close,
    call(fn, ...args) {
      fn.call(this, ...args);
    },
    keypress(event) {
      if (event.key === 'Escape') this.close();
    },
  },
};
</script>

<style lang="less">
@import 'src/main';

.fullscreen() {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}

.oboardist-container {
  .fullscreen();

  z-index: @zindex;
  display: flex;
  justify-content: center;
  align-items: center;
}

.backdrop {
  .fullscreen();
  z-index: @zindex - 1;
  background: black;
  opacity: 0.3;
}

:global(.oboardist-container .box) {
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