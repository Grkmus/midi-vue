<template lang="pug">
.white-key(v-bind:class='{ pressed: currentVelocity}')
  span {{ note }}
</template>

<script>
export default {
  name: 'WhiteKey',
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

.pressed {
  background-color: orangered;
}

span {
  position: relative;
  top: 80%;
  border-radius: 5px;
  padding: 5px;
  background: rgb(209, 208, 208);
  font: outline;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bolder;
}
</style>
