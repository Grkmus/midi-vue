<template>
  <div class="key" v-bind:class="{ pressed: velocity}" >
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
.key {
  width: 50px;
  height: auto;
  border: 1px solid;
  background-color: whitesmoke;
  margin: 0;
  padding: 0;
}

.pressed {
  background-color: orangered;
}
</style>
