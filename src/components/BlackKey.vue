<template lang="pug">
.black-key(v-bind:class='{ pressed: currentVelocity}')
  span {{ note }}
</template>

<script>
export default {
  name: 'BlackKey',
  props: {
    velocity: Number,
    note: String,
  },
  data() {
    return {
      currentVelocity: 0,
    };
  },
  mounted() {
    this.$root.$on('reset', this.releaseKey);
  },
  methods: {
    pressKey(velocity) {
      this.currentVelocity = velocity;
    },
    releaseKey() {
      this.currentVelocity = 0;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

span {
  position: relative;
  top: 70%;
  padding: 5px;
  padding-right: 5px;
  padding-left: 5px;
  border-radius: 5px;
  background: rgb(209, 208, 208);
  font: outline;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: 75%;
}

.pressed {
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}
</style>
