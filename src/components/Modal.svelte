<!-- <div class="container" ref:el>
  <div class="modal">
    {#if title}
      <div class="header" style="color: { headerTextColor }">{ title }</div>
    {/if}
    <div class="content">
      {@html content }
    </div>
  </div>
</div> -->
<div ref:el>
  <Box title={title}>
    <div slot="content">{@html content}</div>
    <div slot="buttons">
      {#each buttons as button}
        <Button on:click=button.handler()>{button.text}</Button>
      {/each}
    </div>
  </Box>
</div>

<script>
import Box from './Box.svelte';
import Button from './Button.svelte';
import { oncreate, show, hide } from '../methods';

export default {
  oncreate,
  components: { Box, Button },
  data: () => ({
    title: '',
    buttons: [
      { text: 'OK', handler: () => this.close() },
    ],
    content: '',
    backgroundColor: Onboardist.UI.config.colors.active,
    headerTextColor:  Onboardist.UI.config.colors.lightText,
  }),
  methods: {
    show,
    hide,
    close() {
      this.destroy();
    },
  }
};
</script>

<style lang="less">
@import 'src/main';

.container {
  margin: 5px;
  display: inline-block;
}

.modal {
  border-radius: 12px;
  /* border: 1px solid #ececec; */
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.05);
  min-width: 100px;
  min-height: 100px;
  background: white;

  .header {
    font-size: 18px;
    font-weight: bold;
    padding: 12px 20px;
    border-radius: 12px 12px 0 0;
    background-color: @color;
  }

  .content {
    padding: 20px;
  }
}
</style>