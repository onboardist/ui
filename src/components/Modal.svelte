<div ref:el>
  <Box title={title}>
    <div slot="content">{@html content}</div>
    <div slot="buttons">
      {#each buttons as button}
        <button class="onboardist-button" on:click="call(button.handler)">{button.text}</button>
      {/each}
    </div>
  </Box>
</div>

<script>
import Box from './Box.svelte';
import { oncreate, show, hide } from '../methods';

export default {
  oncreate,
  components: { Box },
  data() {
    return {
      title: '',
      buttons: [{
        text: 'OK',
        handler() { this.close() },
      }],
      content: '',
      backgroundColor: Onboardist.UI.config.colors.active,
      headerTextColor:  Onboardist.UI.config.colors.lightText,
    };
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

</style>