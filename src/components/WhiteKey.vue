<template lang="pug">
.white-key(v-bind:class='{ pressed: currentVelocity}')
  span {{ note }}
</template>

<script>
import piano from '../models/Piano';

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
    pressKey(velocity, midiNumber) {
      piano.keyDown({ midi: midiNumber });
      this.currentVelocity = velocity;
    },
    releaseKey(midiNumber) {
      this.currentVelocity = 0;
      piano.keyUp({ midi: midiNumber });
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
