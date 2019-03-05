<div>
  {#if backdrop}
    <div class="onboardist-backdrop"></div>
  {/if}
</div>

<script>
export default {
  data: () => ({
    backdrop: false,
  }),
  oncreate() {
    // Singleton
    if (!document.querySelector('.onboardist-backdrop')) {
      this.set({ backdrop: true });
    } else {
      this.destroy();
    }
  },
}
</script>

<style lang="less">
@import 'src/main';

.onboardist-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: @zindex - 1;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}
</style>