<template>
  <div id="app">
    <div id="player">
      <input @change="readFile" type="file" ref="filereader" name="midi" id="filereader">
      <!-- <button @click="readMidi">Read</button> -->
      <button @click="playMidi">Play</button>
    </div>
    <div id="sheet">
      <runner ref="runner"
      :midiJson="midiJson"
      :height="sheetHeight"
      :width="sheetWidth"
      :keyWidth="keyWidth"></runner>
    </div>
    <div id="keyboard">
      <octave :ref="k" :octaveWidth="octaveWidth" :keyWidth="keyWidth" :key="k" v-for="k in octaveAmount"></octave>
    </div>
  </div>
</template>

<script>
import { Midi } from '@tonejs/midi';
import Octave from './components/Octave.vue';
import Runner from './components/Runner.vue';

export default {
  name: 'App',
  components: {
    Octave,
    Runner,
  },
  data() {
    return {
      reader: new FileReader(),
      sheetHeight: null,
      sheetWidth: null,
      midiJson: null,
      file: null,
      octaveAmount: 5,
    };
  },
  mounted() {
    this.sheetHeight = this.$el.querySelector('#sheet').offsetHeight;
    this.sheetWidth = this.$el.querySelector('#sheet').offsetWidth;

    this.file = this.$refs.filereader;
    this.reader.addEventListener('onerror', (e) => {
      console.log('load different.', e);
    });
    this.reader.addEventListener('load', (e) => {
      console.log('reading file', e.target.result);
      this.midiJson = new Midi(e.target.result);
      console.log('Loaded midi file: ', this.midiJson);
    });
  },
  computed: {
    octaveWidth() { return this.sheetWidth / this.octaveAmount; },
    keyWidth() { return this.octaveWidth / 12; },
  },
  methods: {
    readFile() {
      // triggers the load event!
      this.reader.readAsArrayBuffer(this.$refs.filereader.files[0]);
    },
    playMidi() {
      this.$refs.runner.playMidi();
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
  height: 100%;
}
#player {
  position: relative;
  display: flex;
  height: 5%;
  justify-content: center;
  background: #2c3e50;
  z-index: 1;
}
#sheet {
  display: flex;
  height: 80%;
  width: 100%;
}
#keyboard {
  display: flex;
  width: 100%;
  height: 15%;
}

html, body {
  background-color: rgb(59, 54, 54);
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
