<div class="container" ref:el>
  <div class="modal">
    {#if title}
      <div class="header" style="background-color: { color }">{ title }</div>
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
  methods: {
    show, hide,
  },
  data: () => ({
    title: '',
    // color: OnboardistUI.config.colors.active,
  }),
};
</script>

<style lang="less">
.container {
  margin: 5px;
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
    /* background-color: #62A8FC; */
    border-radius: 12px 12px 0 0;
    color: white;
  }

  .content {
    padding: 20px;
  }
}
</style>