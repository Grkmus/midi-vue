<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <input @change="readFile" type="file" name="midi" id="midi">
    <!-- <button @click="parseFile" >Play</button> -->
    <p :key="input" v-for="input in inputs">{{input}}</p>
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
      inputs: Array,
      outputs: Array,
      midiAccess: null,
      midiDevice: null,
    };
  },
  created() {
    for (let i = 36; i < 36 + this.keyAmount; i += 1) {
      this.$set(this.keys, i, 0);
    }
    this.reader.addEventListener('load', (e) => this.playMidi(e));
    this.player.on('midiEvent', (e) => {
      const { noteNumber, velocity } = e;
      if (e.name === 'Note on') this.playNote(noteNumber, velocity);
    });

    navigator.requestMIDIAccess().then(this.onMIDISuccess, this.onMIDIFailure);
    // this.startLoggingMIDIInput(this.midiAccess, 2);
  },
  // mounted() {
  //   this.startLoggingMIDIInput(this.midiAccess, 2);
  // },
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
    onMIDISuccess(midiAccess) {
      console.log('MIDI ready!');
      this.midiAccess = midiAccess;
      this.startLoggingMIDIInput(this.midiAccess, 2);
      // store in the global (in real usage, would probably keep in an object instance)
    },
    onMIDIFailure(msg) {
      console.log(`Failed to get MIDI access - ${msg}`);
    },
    onMIDIMessage(event) {
      let str = `MIDI message received at timestamp ${event.timestamp}[${event.data.length} bytes]: `;
      for (let i = 0; i < event.data.length; i++) { //eslint-disable-line
        str += `0x${event.data[i].toString(16)} `;
      }
      console.log(str);
    },
    startLoggingMIDIInput(midiAccess) {//eslint-disable-line
      this.midiDevice = this.midiAccess.inputs.get('input-2');
      this.midiDevice.onmidimessage = this.onMIDIMessage;
      // this.midiAccess.inputs.forEach((input) => {
      //   if (input.name === 'GO:KEYS') {
      //     this.midiDevice = input;
      //     this.midiDevice.onmidimessage = this.onMIDIMessage;
      //   }
      // });
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
