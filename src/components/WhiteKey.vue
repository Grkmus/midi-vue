<template lang="pug">
.white-key(v-bind:class='{ pressed: currentVelocity}' :style="{'background-color': keyColor}")
  span {{ note }}
</template>

<script>
import { interpolateMagma } from 'd3-scale-chromatic';
import { scaleSequential } from 'd3-scale';
import { color } from 'd3-color';

export default {
  name: 'WhiteKey',
  props: {
    velocity: Number,
    note: String,
    midiNumber: Number,
  },
  data() {
    return {
      currentVelocity: 0,
      keyColor: 'white',
    };
  },
  mounted() {
    this.$root.$on('reset', this.releaseKey);
    this.colorScale = scaleSequential().domain([13, 91]).interpolator(interpolateMagma);
    // console.log(this.note);
    this.keyColor = color(this.colorScale(this.midiNumber));
    // console.log(rawColor)
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
.white-key{
  box-shadow: 0 9px #999;
}
.pressed {
  /* background-color: white !important; */
  box-shadow: inset 0 0 10px #2c3e50;
  transform: translateY(4px);
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
