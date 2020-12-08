<template>
  <div class="white-key" v-bind:class="{ pressed: velocity}">
  </div>
</template>

<script>
export default {
  name: 'WhiteKey',
  props: {
    velocity: Number,
    note: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.white-key {
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
