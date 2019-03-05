{#if shown}
  <NineSlice {target}></NineSlice>
  <div class="onboardist-coachmark">
    {#if buttons}
      {#each buttons as button}
        <ActionButton on:click="call(button.handler)">{button.text}</ActionButton>
      {/each}
    {:else}
      &nbsp;
    {/if}
    <Text ref:text text={content} {target}></Text>
    <Arrow from={textElement} to={target}></Arrow>
  </div>
{/if}

<script>
import ActionButton from './coachmark/ActionButton.svelte';
import Arrow from './coachmark/Arrow.svelte';
import NineSlice from './NineSlice.svelte';
import Text from './coachmark/Text.svelte';
import injectSVG from './coachmark/inject-svg';
import svg from './coachmark/defs.svg';
import { close, oncreate, ondestroy } from '../methods';

export default {
  data: () => ({
    buttons: null,
    shown: true,
    target: null,
    textElement: null,
  }),
  components: { ActionButton, Arrow, NineSlice, Text },
  oncreate() {
    if (this.get().buttons) this.set({ buttons: expandButtonArgs(this.get().buttons) });
    
    injectSVG(svg);

    return oncreate.call(this);
  },
  onstate({ changed, current, previous }) {
    if (current.attach) this.set({ target: current.attach });
    // console.log( this.refs.text);
    // window.t =  this.refs.text;
    if (this.refs && this.refs.text) this.set({ textElement: this.refs.text.refs.text });
  },
  ondestroy,
  methods: {
    close,
    call(fn, ...args) {
      fn.call(this, ...args);
    },
  },
};
</script>

<style lang="less">
</style>