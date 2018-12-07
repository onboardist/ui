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
import { show, hide } from '../methods';

export default {
  // oncreate,
  components: { Box },
  data() {
    return {
      title: '',
      buttons: [{
        text: 'OK',
        handler() { this.close() },
      }],
      content: '',
    };
  },
  oncreate() {
    // console.log(this.refs.box.el);

    // const { el } = this.refs.box.refs;
    // const h = this.height = el.offsetHeight;
    // const w = this.width = el.offsetWidth;

    // el.style.height = `${h}px`;
    // el.style.width = `${w}px`;

    // el.classList.add('positioned');
  },
  methods: {
    show,
    hide,
    call(fn, ...args) {
      fn.call(this, ...args);
    },
    close() {
      this.destroy();
    },
  }
};
</script>

<style lang="less">
@import 'src/main';

.oboardist-modal {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: @zindex;
  position: absolute;
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