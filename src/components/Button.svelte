<button type="button" on:click="fire('click', event)">
  <slot></slot>
</button>

<script>
export default {}
</script>

<style lang="less">
@import 'src/main';

button {
  border-radius: 8px;
  /* padding: 1.25em 2em; */
  border: 1px solid darken(@color, 20%);
  /* background-color: @color; */
  font-size: .8em;
  padding: .5em 1em;
  margin: .5em;

  &:hover {
    background-color: white;
  }
}
</style>