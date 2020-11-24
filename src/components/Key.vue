<template>
  <div class="col" v-bind:class="{ pressed: velocity}" >
  </div>
</template>

<script>
export default {
  name: 'Key',
  props: {
    velocity: Number,
    note: String,
    color: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div {
  width: 50px;
  height: 500px;
  border: solid;
  background-color: black;
}

.pressed {
  background-color: orangered;
}
</style>
