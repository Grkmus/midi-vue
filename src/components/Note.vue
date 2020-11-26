<template>
  <div class="note" v-bind:class="{ playing: velocity}"></div>
</template>

<script>
export default {
  name: 'Note',
  props: {
    velocity: Number,
    note: String,
    color: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.note {
  width: auto;
  position: relative;
  height: 150px;
  background-color: green;
  margin: 0;
  padding: 0;
  z-index: -11;
}
.playing {
  background-color: orangered;
}
</style>
