<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <input @change="readFile" type="file" name="midi" id="midi">
    <!-- <button @click="parseFile" >Play</button> -->
    <div class="row">
      <key :key="k" :ref="k" :velocity="v" v-for="(v, k) in keys"></key>
    </div>
  </div>
</template>

<script>
import MidiPlayer from 'midi-player-js';
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
    };
  },
  created() {
    for (let i = 36; i < 36 + this.keyAmount; i += 1) {
      this.$set(this.keys, i, 0);
    }
    this.reader.addEventListener('load', (e) => {
      console.log('load event triggered!');
      this.playMidi(e);
    });
    this.player.on('midiEvent', (e) => {
      const { noteNumber, velocity } = e;
      if (e.name === 'Note on') this.playNote(noteNumber, velocity);
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
      this.keys[noteNumber] = velocity;
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
</style>
