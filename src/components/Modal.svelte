<div class="container" ref:el>
  <div class="modal">
    {#if title}
      <div class="header" style="background-color: { backgroundColor }; color: { headerTextColor }">{ title }</div>
    {/if}
    <div class="content">
      {@html content }
    </div>
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
    backgroundColor: OnboardistUI.Config.colors.active,
    headerTextColor:  OnboardistUI.Config.colors.lightText,
  }),
};
</script>

<style lang="less">
.container {
  margin: 5px;
  display: inline-block;
}

.modal {
  border-radius: 12px;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.05);
  min-width: 100px;
  min-height: 100px;
  background: white;

  .header {
    font-size: 18px;
    font-weight: bold;
    padding: 12px 20px;
    border-radius: 12px 12px 0 0;
  }

  .content {
    padding: 20px;
  }
}
</style>