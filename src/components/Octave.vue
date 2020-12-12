<template>
  <div :style="{width: `${octaveWidth}px`}" class="octave">
    <div class="white-keys">
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" key="C" note="C"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}" key="D" note="D"></white-key>
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" key="E" note="E"></white-key>
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" key="F" note="F"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}" key="G" note="G"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}" key="A" note="A"></white-key>
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" key="B" note="B"></white-key>
    </div>
    <div class="black-keys">
      <black-key :style="{ width: `${blackKeyWidth}px`, left:`${blackKeyWidth}px`}" key="C#" note="C#"></black-key>
      <black-key :style="{ width: `${blackKeyWidth}px`, left:`${blackKeyWidth * 3}px`}" key="D#" note="D#"></black-key>
      <black-key :style="{ width: `${blackKeyWidth}px`, left:`${blackKeyWidth* 6}px`}" key="F#" note="F#"></black-key>
      <black-key :style="{ width: `${blackKeyWidth}px`, left:`${blackKeyWidth * 8}px`}" key="G#" note="G#"></black-key>
      <black-key :style="{ width: `${blackKeyWidth}px`, left:`${blackKeyWidth * 10}px`}" key="A#" note="A#"></black-key>
    </div>
  </div>
</template>

<script>
import WhiteKey from './WhiteKey.vue';
import BlackKey from './BlackKey.vue';

export default {
  components: { WhiteKey, BlackKey },
  name: 'Octave',
  data() {
    return {
      calculatedKeyWidth: null,
    };
  },
  computed: {
    octaveWidth() { return this.$parent.sheetWidth / this.$parent.octaveAmount; },
    blackKeyWidth() { return this.octaveWidth / 12; },
    whiteKeyWidth() { return this.blackKeyWidth * 2; },
    irregularWhiteKeyWidth() { return this.whiteKeyWidth * 0.75; },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.octave {
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
}
.white-keys {
  display: flex;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  position: absolute;
}
.black-keys {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  top:0;
  left: 0;
  position: absolute;
}

.white-key {
  height: 100%;
  border: 1px solid;
  background-color: whitesmoke;
  margin: 0;
  padding: 0;
}

.black-key {
  height: calc(100% / 1.5);
  border: 1px solid;
  background-color: rgb(27, 27, 32);
  margin: 0;
  padding: 0;
  position: absolute;
}
</style>
