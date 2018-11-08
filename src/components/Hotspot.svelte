<div ref:el>
  <div class="hotspot { style }">
    <div class="dot" style="width: { size }px; height: { size }px; margin: -{ size / 2 }px"></div>

    {#if style == 'pulse'}
      <div class="pulse" style="width: { size }px; height: { size }px; margin: -{ size / 2 }px"></div>
    {/if}
    {#if style == 'teardrop'}
      <div class="hotspot-arrow"></div>
    {/if}
  </div>
</div>

<script>
import Config from '../config';
import { oncreate, show, hide } from '../methods';

/**
 * Hotspot
 * 
 * @param   {number} [size=20] The size of the hotspot in pixels
 * @param   {string} [style="pulse"] The style of hotspot. Valid values: 'pulse', 'teardrop'
 * 
 * @return  {Hotspot} Hotspot instance
 */
export default {
  oncreate,
  data: () => ({
    color: Config.colors.active,
    style: 'pulse',
    size: 20,
  }),

  methods: {
    show, hide,
  },
};
</script>

<style lang="less">
@color: #62A8FC;

.hotspot {
  position: absolute;
  cursor: pointer;

  .dot {
    position: absolute;
    top: 50%;
    left: 50%;

    border-radius: 50%;
    background-color: @color;
  }

  &.pulse {
    .dot {
      border: 2px solid darken(@color, 5%);
    }

    .pulse {
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;

      border: 2px solid @color;
      animation: pulsate 2s ease-out;
      animation-iteration-count: infinite;
    }

    @keyframes pulsate {
      0% {
        transform: scale(1.0, 1.0);
        opacity: 0.9;
      }
      100% {
        transform: scale(2.5, 2.5);
        opacity: 0.0;
      }
    }
  }

  &.teardrop {
    .dot { border-top-left-radius: 0; }

    :global([x-placement^="top"]) & .dot {
      transform: rotate(225deg);
    }

    :global([x-placement^="right"]) & .dot {
      transform: rotate(315deg);
    }

    :global([x-placement^="bottom"]) & .dot {
      transform: rotate(45deg);
    }

    :global([x-placement^="top"]) & .dot {
      transform: rotate(315deg);
    }
  }
}
</style>