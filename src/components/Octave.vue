<template>
  <div :style="{width: `${octaveWidth}px`}" class="octave">
    <div class="white-keys">
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" ref="C"  key="C" note="C"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}"          ref="D"  key="D" note="D"></white-key>
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" ref="E"  key="E" note="E"></white-key>
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" ref="F"  key="F" note="F"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}"          ref="G"  key="G" note="G"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}"          ref="A"  key="A" note="A"></white-key>
      <white-key :style="{ width: `${irregularWhiteKeyWidth}px`}" ref="B"  key="B" note="B"></white-key>
    </div>
    <div class="black-keys">
      <black-key :style="{ width: `${keyWidth}px`, left:`${keyWidth}px`}"      ref="C#" key="C#" note="C#"></black-key>
      <black-key :style="{ width: `${keyWidth}px`, left:`${keyWidth * 3}px`}"  ref="D#" key="D#" note="D#"></black-key>
      <black-key :style="{ width: `${keyWidth}px`, left:`${keyWidth* 6}px`}"   ref="F#" key="F#" note="F#"></black-key>
      <black-key :style="{ width: `${keyWidth}px`, left:`${keyWidth * 8}px`}"  ref="G#" key="G#" note="G#"></black-key>
      <black-key :style="{ width: `${keyWidth}px`, left:`${keyWidth * 10}px`}" ref="A#" key="A#" note="A#"></black-key>
    </div>
  </div>
</template>

<script>
import WhiteKey from './WhiteKey.vue';
import BlackKey from './BlackKey.vue';

export default {
  components: { WhiteKey, BlackKey },
  name: 'Octave',
  props: {
    keyWidth: Number,
    octaveWidth: Number,
  },
  computed: {
    whiteKeyWidth() { return this.keyWidth * 2; },
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
  border-radius: 5px;
  background-color: whitesmoke;
  margin: 0;
  padding: 0;
}

.black-key {
  height: calc(100% / 1.5);
  border: 1px solid;
  border-radius: 5px;
  background-color: rgb(27, 27, 32);
  margin: 0;
  padding: 0;
  position: absolute;
}
</style>
