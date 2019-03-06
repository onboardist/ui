{#if shown}
  <NineSlice {target}></NineSlice>
  <div class="onboardist-coachmark">
    {#if buttons}
      {#each buttons as button}
        {#if typeof(button) === 'object'}
          <ActionButton type={button.type} on:click="call(button.handler)"></ActionButton>
        {/if}
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
import { close, expandButtonArgs, hide, oncreate, ondestroy, show } from '../methods';

export default {
  data: () => ({
    buttons: ['ok'],
    shown: true,
    target: null,
    textElement: null,
  }),
  components: { ActionButton, Arrow, NineSlice, Text },
  oncreate() {
    injectSVG(svg);

    return oncreate.call(this);
  },
  onstate({ changed, current, previous }) {
    if (!previous && this.get().buttons) this.set({ buttons: expandButtonArgs(this.get().buttons) });

    if (current.attach) this.set({ target: current.attach });
    if (this.refs && this.refs.text) this.set({ textElement: this.refs.text.refs.text });
  },
  ondestroy,
  methods: {
    hide,
    call(fn, ...args) {
      fn.call(this, ...args);
    },
    close,
    show,
  },
};
</script>

<style lang="less">
</style>