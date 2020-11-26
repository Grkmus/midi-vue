<template>
  <div id="app">
    <input @change="readFile" type="file" name="midi" id="midi">
    <button @click="isConfiguring = !isConfiguring" >{{isConfiguring}}</button>
    <div id="sheet">
      <note-bar :key="'bar_' + k" :velocity="v.velocity" :delta="v.delta" v-for="(v, k) in bars">

      </note-bar>
    </div>
    <div id="keyboard">
      <key :key="k" :velocity="v" v-for="(v, k) in keys"></key>
    </div>
  </div>
</template>

<script>
import MidiPlayer from 'midi-player-js';
import WebMidi from 'webmidi';
import Key from './components/Key.vue';
import NoteBar from './components/NoteBar.vue';

export default {
  name: 'App',
  components: {
    Key,
    NoteBar,
  },
  data() {
    return {
      player: new MidiPlayer.Player(),
      midiFile: null,
      dataUri: null,
      reader: new FileReader(),
      keys: {},
      bars: {},
      inputs: Array,
      outputs: Array,
      midiAccess: null,
      midiDevice: null,
      isConfiguring: false,
      start: 36,
      end: 96,
    };
  },
  created() {
    for (let i = this.start; i < this.end; i += 1) {
      this.keys[i] = 0;
    }
    this.reader.addEventListener('load', (e) => this.playMidi(e));
    this.player.on('midiEvent', (e) => {
      console.log(e);
      const { noteNumber, velocity, delta } = e;
      if (e.name === 'Note on') this.playNoteFromSong(noteNumber, velocity, delta);
    });
    // this.player.on('playing', (e) => {
    //   console.log(e);
    //   this.$emit('tick', e.tick);
    // });
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
    playNoteFromSong(noteNumber, velocity, delta) {
      this.$set(this.bars, noteNumber, { velocity, delta });
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
    doConfigure() {
      for (let i = this.start; i < this.end; i += 1) {
        this.keys[i] = 0;
        this.bars[i] = 0;
      }
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
#keyboard {
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
  align-items: flex-end;
  align-content: center;
}
#sheet {
  display: flex;
  position: fixed;
  width: 100%;
  align-items: flex-end;
  align-content: center;
}
body {
  background-color: rgb(59, 54, 54);
  margin: 0;
  padding: 0;
}
</style>
