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
{#if backdrop}<Backdrop></Backdrop>{/if}

<script>
import Config from '../config';
import Backdrop from './Backdrop.svelte';
import { oncreate, ondestroy } from '../methods';

export default {
  oncreate() {
    // NOTE: this was an attempt to make the popper overlap the element slightly. Turns out just making it
    //   0w x 0h is easier
    // this.options = {
    //   ...this.options,
    //   modifiers: {
    //     offset: {
    //       enabled: true,
    //       offset: `-50%p,-50%p`, // -${this.get().size / 2}px
    //     },
    //     flip: {
    //       enabled: false,
    //     }
    //   },
    // };

    return oncreate.call(this);
  },
  ondestroy,
  components: { Backdrop },
  data: () => ({
    backdrop: false,
    color: Config.colors.active,
    style: 'pulse',
    size: 20,
  }),
};
</script>

<style lang="less">
@import 'src/main';
/* @color: #62A8FC; */
ref:el {
  z-index: @zindex;
}

.hotspot {
  position: absolute;
  z-index: @zindex;
  cursor: pointer;

  .dot {
    position: absolute;
    z-index: @zindex;
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
      z-index: @zindex;
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