<div class="container" ref:el>
  <div class="tooltip" style="background-color: { color }">
    {#if title}
      <div class="header" style="color: { textColor }">{ title }</div>
    {/if}
    <div class="content" style="color: { textColor }">
      {@html content }
    </div>
    <div class="tooltip-arrow" x-arrow style="background-color: { color }"></div>
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
    content: '',
    color: OnboardistUI.Config.colors.active,
    textColor: OnboardistUI.Config.colors.lightText,
  }),
};
</script>

<style lang="less">
.container {
  margin: 5px;
}

.tooltip {
  border-radius: 12px;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.05);
  /* min-width: 100px;
  min-height: 100px; */
  background: white;

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
    background: red;
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