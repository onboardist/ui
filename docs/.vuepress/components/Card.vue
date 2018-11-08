<template>
  <div class="md-card">
    <div v-if="image" class="card-image">
      <img :src="$withBase(image)" alt="">
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['image']
};
</script>

<style lang="stylus">
.md-card
  min-width 170px
  border 1px solid $borderColor
  border-radius 0.5rem
  box-shadow 0 5px 15px -5px rgba(0,0,0,.1)
  padding 0.5rem
  margin-top 1em
  min-height 150px
  display flex
  flex-direction row
  align-items: stretch
  .card-image
    display flex
    align-items center
    padding 0.5rem
    img 
      max-width 150px
      max-height 150px
      height 150px
      border: 1px solid #eee;
      border-radius 0.2rem
      object-fit cover
  .card-content
    padding 0.5rem
    flex-grow 1
    p
      line-height normal
      -webkit-margin-before 0em
      -webkit-margin-after 0.5em
    blockquote 
      font-size 1rem
</style>