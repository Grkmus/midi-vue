<template>
  <div id="app">
    <div id="player">
      <input @change="readFile" type="file" name="midi" id="midi">
      <button @click="test" >{{isConfiguring}}</button>
      <button @click="animate" >Animate</button>
    </div>
    <div id="sheet">
      <runner :height="sheetHeight" :width="sheetWidth"></runner>
    </div>
    <div id="keyboard">
      <key :key="`key${k}`" :velocity="v" v-for="(v, k) in keys"></key>
    </div>
  </div>
</template>

<script>
import MidiPlayer from 'midi-player-js';
import WebMidi from 'webmidi';
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
      player: new MidiPlayer.Player(),
      midiFile: null,
      dataUri: null,
      reader: new FileReader(),
      inputs: Array,
      outputs: Array,
      keys: {},
      bars: {},
      midiAccess: null,
      midiDevice: null,
      isConfiguring: false,
      start: 36,
      end: 96,
      sheetHeight: null,
      sheetWidth: null,
      currentTick: 0,
    };
  },
  created() {
    for (let i = this.start; i < this.end; i += 1) {
      this.$set(this.keys, i, 0);
      this.$set(this.bars, i, {
        note: {
          velocity: 0,
          delta: 0,
        },
      });
    }
    this.reader.addEventListener('load', (e) => this.playMidi(e));
    this.player.on('playing', (e) => {
      console.log(e);
      if (this.currentTick === this.sheetLength) this.currentTick = 0;
      this.currentTick += 1;
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
  mounted() {
    this.sheetHeight = this.$el.querySelector('#sheet').offsetHeight;
    this.sheetWidth = this.$el.querySelector('#sheet').offsetWidth;
  },
  methods: {
    animate() {
      this.$refs.bar36[0].animate();
    },
    test() {
      console.log('test');
      this.$refs.bar36[0].createNote();
      this.$refs.bar37[0].createNote();
    },
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
      console.log('Playing: ', noteNumber, velocity, delta);
      console.log({ velocity, delta });
      console.log(this.bars[noteNumber]);
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
  /* display: flex;
  flex-wrap: nowrap;
  flex-direction: column; */
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
