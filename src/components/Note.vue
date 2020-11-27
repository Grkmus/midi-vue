<template>
  <div :style="{top: position}" class="note"></div>
</template>

<script>
export default {
  name: 'Note',
  props: {
    position: null,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.note {
  margin: 0;
  padding: 0;
  height: 50px;
  width: 100%;
  background-color: red ;
  position: absolute;
}
</style>
