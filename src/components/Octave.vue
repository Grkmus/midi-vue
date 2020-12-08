<template>
  <div class="octave">
    <white-key key="C" note="C"></white-key>
    <black-key key="C#" note="C#"></black-key>
    <white-key key="D" note="D"></white-key>
    <black-key key="D#" note="D#"></black-key>
    <white-key key="E" note="E"></white-key>
    <white-key key="F" note="F"></white-key>
    <black-key key="F#" note="F#"></black-key>
    <white-key key="G" note="G"></white-key>
    <black-key key="G#" note="G#"></black-key>
    <white-key key="A" note="A"></white-key>
    <black-key key="A#" note="A#"></black-key>
    <white-key key="B" note="B"></white-key>
  </div>
</template>

<script>
import WhiteKey from './WhiteKey.vue';
import BlackKey from './BlackKey.vue';

export default {
  components: { WhiteKey, BlackKey },
  name: 'Octave',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.octave {
  display: contents;
  width: 600px;
  height: auto;
  background-color: whitesmoke;
  margin: 0;
  padding: 0;
}
</style>
