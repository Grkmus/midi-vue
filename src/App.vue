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
      <key :key="`key${k}`" :velocity="v" v-for="(v, k) in keys"></key>
    </div>
  </div>
</template>

<script>
import WebMidi from 'webmidi';
import { Midi } from '@tonejs/midi';
import _ from 'lodash';
import Key from './components/Key.vue';
import Runner from './components/Runner.vue';

export default {
  name: 'App',
  components: {
    Key,
    Runner,
  },
  data() {
    return {
      inputs: Array,
      outputs: Array,
      keys: {},
      reader: new FileReader(),
      midiAccess: null,
      midiDevice: null,
      start: 36,
      end: 96,
      sheetHeight: null,
      sheetWidth: null,
      keyWidth: null,
      currentTick: 0,
      midiJson: null,
      source: null,
      tempo: null,
    };
  },
  created() {
    for (let i = this.start; i < this.end; i += 1) {
      this.$set(this.keys, i, 0);
    }
    WebMidi.enable(() => {
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs);
      this.midiDevice = WebMidi.getInputByName('GO:KEYS');
      this.midiDevice.addListener('noteon', 'all', (e) => {
        this.playNote(e.note.number, e.rawVelocity);
        if (this.isConfiguring) this.$emit('noteon', e.note.number);
      });
      this.midiDevice.addListener('noteoff', 'all', (e) => {
        this.playNote(e.note.number, 0);
      });
    });
  },
  mounted() {
    this.sheetHeight = this.$el.querySelector('#sheet').offsetHeight;
    this.sheetWidth = this.$el.querySelector('#sheet').offsetWidth;
    this.keyWidth = this.$el.querySelector('.key').getBoundingClientRect().width;
    this.source = this.$refs.filereader;

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
    totalTime() {
      return _.sumBy(this.midiJson.track[1].event, 'deltaTime');
    },
  },
  methods: {
    playNote(noteNumber, velocity) {
      this.$set(this.keys, noteNumber, velocity);
    },
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
