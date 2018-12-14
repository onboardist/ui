<div class="container" ref:el>
  <div class="tooltip">
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
    <div class="tooltip-arrow" x-arrow></div>
  </div>  
</div>

<script>
import Box from './Box.svelte';
import { oncreate, ondestroy, close, expandButtonArgs, hide, show } from '../methods';

export default {
  components: { Box },
  oncreate() {
    this.options.modifiers = this.options.modifiers || {};
    if (this.get().buttons) this.set({ buttons: expandButtonArgs(this.get().buttons) });

    return oncreate.call(this);
  },
  ondestroy,
  methods: {
    close,
    show,
    hide,
    call(fn, ...args) {
      fn.call(this, ...args);
    },
  },
  data: () => ({
    title: '',
    content: '',
    buttons: ['ok'],
  }),
};
</script>

<style lang="less">
@import 'src/main';

.container {
  margin: 5px;
  z-index: @zindex;

  :global(&[x-placement^="right"]) {
    margin-left: 30px;
  }

  :global(&[x-placement^="left"]) {
    margin-right: 30px;
  }

  :global(&[x-placement^="bottom"]) {
    margin-top: 30px;
  }

  :global(&[x-placement^="top"]) {
    margin-bottom: 30px;
  }
}

.tooltip {
  border-radius: 12px;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.05);
  background: white;

  :global(.box) {
    margin: 0 !important;
    color: white;
    background-color: @color !important;
  }

  :global(.box > .box-content:first-child) {
    padding-top: 10px !important;
  }

  :global(.box .box-header) {
    padding: 10px !important;
  }

  :global(.box .box-content) {
    padding: 5px 10px !important;
  }

  :global(.box .box-buttons) {
    padding: 0;
  }

  :global(.box .box-buttons button) {
    background-color: @color;
    color: white;
    border-color: white;
  }

  .header {
    font-size: 18px;
    font-weight: bold;
    padding: 12px 20px;
    border-radius: 12px 12px 0 0;
  }

  .content {
    padding: 5px 20px 20px;
  }

  .tooltip-arrow {
    background: @color;
    height: 10px;
    width: 10px;
    position: absolute;
    display: inline-block;
    transform: rotate(45deg);

    :global([x-placement^="right"]) & {
      left: -3px;
    }

    :global([x-placement^="left"]) & {
      right: -3px;
    }

    :global([x-placement^="bottom"]) & {
      top: -3px;
    }

    :global([x-placement^="top"]) & {
      bottom: -3px;
    }
  }
}
</style>