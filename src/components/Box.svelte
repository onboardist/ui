<div class="box" ref:el>
    {#if title}
      <div class="box-header" style="background-color: { backgroundColor }; color: { headerTextColor }">{ title }</div>
    {/if}
    <div class="box-content">
      <slot name="content"></slot>
    </div>
    <div class="box-buttons">
      <slot name="buttons"></slot>
    </div>
</div>

<script>
import { oncreate, show, hide } from '../methods';
export default {
  oncreate,
  methods: { show, hide },
  data: () => ({
    title: '',
    content: '',
    backgroundColor: Onboardist.UI.config.colors.active,
    headerTextColor: Onboardist.UI.config.colors.lightText,
  }),
};
</script>

<style lang="less">
@import 'src/main';

.box {
  margin: 5px;
  display: inline-block;
  border-radius: 8px;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.05);
  min-width: 100px;
  min-height: 100px;
  background: white;

  .box-header {
    font-size: 18px;
    font-weight: bold;
    padding: 12px 20px;
    border-radius: 8px 8px 0 0;
  }

  .box-content {
    padding: 20px;
  }

  .box-buttons {
    color: inherit;

    :global([slot]) {
      display: flex;
      flex-direction: row-reverse;
    }
  }
}
</style>