<template>
  <div :style="{width: `${octaveWidth}px`}" class="octave">
    <div class="white-keys">
      <white-key :style="{ width: `${whiteKeyWidth}px`}" ref="C"  key="C" note="C"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}"          ref="D"  key="D" note="D"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}" ref="E"  key="E" note="E"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}" ref="F"  key="F" note="F"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}"          ref="G"  key="G" note="G"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}"          ref="A"  key="A" note="A"></white-key>
      <white-key :style="{ width: `${whiteKeyWidth}px`}" ref="B"  key="B" note="B"></white-key>
    </div>
    <div class="black-keys">
      <black-key :style="{ width: `${keyWidth}px`, left:`${2 + keyWidth}px`}"      ref="C#" key="C#" note="C#"></black-key>
      <black-key :style="{ width: `${keyWidth}px`, left:`${4 + keyWidth * 3}px`}"  ref="D#" key="D#" note="D#"></black-key>
      <black-key :style="{ width: `${keyWidth}px`, left:`${6 + keyWidth* 6}px`}"   ref="F#" key="F#" note="F#"></black-key>
      <black-key :style="{ width: `${keyWidth}px`, left:`${4 + keyWidth * 8}px`}"  ref="G#" key="G#" note="G#"></black-key>
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
  box-shadow: inset 0 0 5px #4d4c4c;
}

.black-key {
  height: calc(100% / 1.5);
  border-radius: 5px;
  background-color: rgb(49, 49, 49);
  margin: 0;
  padding: 0;
  position: absolute;
  border: 1px solid black;
  box-shadow: 0px 0px 5px #4d4c4c;
}
</style>
