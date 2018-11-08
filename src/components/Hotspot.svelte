<div ref:el>
  <div class="hotspot { style }">
    <div class="dot"></div>

    {#if style == 'pulse'}
      <div class="pulse"></div>
    {/if}
    {#if style == 'teardrop'}
      <div class="hotspot-arrow"></div>
    {/if}
  </div>
</div>

<script>
import Config from '../config';
import { oncreate, show, hide } from '../methods';

export default {
  // oncreate() {
  //   console.log(this.options);
  //   oncreate.apply(this, arguments);
  // },
  oncreate,
  data: () => ({
    color: Config.colors.active,
    style: 'pulse',
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
  /* width: 30px;
  height: 30px; */
  /* margin: 25px; */
  cursor: pointer;

  .dot {
    width: 30px;
    height: 30px;
    margin: -15px;
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
      width: 30px;
      height: 30px;
      border-radius: 50%;
      margin: -15px;
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
    @borderSize: 10px;
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

    /* .hotspot-arrow {
      border-color: @color;
      width: 0;
      height: 0;
      border-style: solid;
      position: absolute;
      margin: @borderSize;
    } */

    /* :global(&[x-placement^="bottom"]) .hotspot-arrow {
      border-width: 0 @borderSize @borderSize @borderSize;
      border-left-color: transparent;
      border-right-color: transparent;
      border-top-color: transparent;
      top: -@borderSize;
      left: calc(50% - @borderSize);
      margin-top: 0;
      margin-bottom: 0;
    }

    :global(&[x-placement^="right"]) .hotspot-arrow {
      border-width: @borderSize @borderSize @borderSize 0;
      border-left-color: transparent;
      border-top-color: transparent;
      border-bottom-color: transparent;
      top: calc(50% - (@borderSize * 2) + 1px);
      left: @borderSize / 2 * -1;
      margin-left: 0;
      margin-right: 0;
    } */
  }
}
</style>