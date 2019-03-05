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
    <Text text={content} {target}></Text>
  </div>
{/if}

<script>
import './coachmark/defs.svg';
import NineSlice from './NineSlice.svelte';
import ActionButton from './coachmark/ActionButton.svelte';
import Text from './coachmark/Text.svelte';
import { close, oncreate, ondestroy } from '../methods';

export default {
  data: () => ({
    shown: true,
  }),
  components: { ActionButton, NineSlice, Text },
  oncreate() {
    console.log(this);
    if (this.get().buttons) this.set({ buttons: expandButtonArgs(this.get().buttons) });

    return oncreate.call(this);
  },
  onstate({ changed, current, previous }) {
    if (current.attach) this.set({ target: current.attach });
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