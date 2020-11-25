<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <input @change="readFile" type="file" name="midi" id="midi">
    <button @click="isConfiguring = !isConfiguring" >{{isConfiguring}}</button>
    <p :key="input" v-for="input in inputs">{{input}}</p>
    <div id="wrapper">
      <key :key="k" :velocity="v" v-for="(v, k) in keys"></key>
    </div>
  </div>
</template>

<script>
import MidiPlayer from 'midi-player-js';
import WebMidi from 'webmidi';
import Key from './components/Key.vue';

export default {
  name: 'App',
  components: {
    Key,
  },
  data() {
    return {
      player: new MidiPlayer.Player(),
      midiFile: null,
      dataUri: null,
      reader: new FileReader(),
      keyAmount: 12,
      keys: {},
      inputs: Array,
      outputs: Array,
      midiAccess: null,
      midiDevice: null,
      isConfiguring: false,
      start: null,
      end: null,
    };
  },
  created() {
    this.doConfigure();
    this.reader.addEventListener('load', (e) => this.playMidi(e));
    this.player.on('midiEvent', (e) => {
      const { noteNumber, velocity } = e;
      if (e.name === 'Note on') this.playNote(noteNumber, velocity);
    });
    this.$on('noteon', (noteNumber) => {
      console.log(noteNumber);
      if (this.start) this.end = noteNumber;
      else this.start = noteNumber;
      if (this.start && this.end) { this.doConfigure(this.start, this.end); }
    });
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
  methods: {
    playMidi(event) {
      this.midiFile = event.target.result;
      this.player.loadArrayBuffer(this.midiFile);
      this.player.play();
    },
    readFile() {
      // triggers the load event!
      this.reader.readAsArrayBuffer(document.getElementById('midi').files[0]);
    },
    playNote(noteNumber, velocity) {
      this.$set(this.keys, noteNumber, velocity);
    },
    configure() {
      this.isConfiguring = true;
      this.start = null;
      this.end = null;
      this.$on('noteon', (noteNumber) => {
        console.log(noteNumber);
        if (this.start) this.end = noteNumber;
        else this.start = noteNumber;
      });
      if (this.start && this.end) { this.doConfigure(this.start, this.end); }
    },
    doConfigure(startKey = 36, endKey = 48) {
      console.log('configuring actual:', startKey, endKey);
      const keys = {};
      for (let i = startKey; i < endKey; i += 1) {
        keys[i] = 0;
      }
      this.keys = keys;
      this.isConfiguring = false;
      console.log('configuring ends!', this.isConfiguring);
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
  margin-top: 60px;
}
#wrapper {
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
  align-items: flex-end;
}
</style>
