<button on:click="handler()">
  <slot></slot>
</button>

<script>
export default {
  // oncreate() {
  //   console.log(this.get('handler'))
  // },
  data() {
    return {
      handler: () => {},
    };
  },
  methods: {
    handler(...args) {
      console.log('this.get()', this.get());
      this.get().handler.call(this, ...args);
    }
  }
}
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