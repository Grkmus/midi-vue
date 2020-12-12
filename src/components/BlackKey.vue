<template>
  <div class="black-key" v-bind:class="{ pressed: velocity}">
  </div>
</template>

<script>
export default {
  name: 'BlackKey',
  props: {
    velocity: Number,
    note: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.pressed {
  background-color: orangered;
}
</style>
