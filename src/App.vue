<template>
  <div id="app">
    <div id="player">
      <div class="panel">
        <label for="filereader"> Chose a midi file
          <input @change="readFile" type="file" name="filereader" ref="filereader" id="filereader">
        </label>
        <div class="midi-player">
          <font-awesome-icon icon="step-backward" size="2x" :style="{ color: 'white' }"/>
          <font-awesome-icon v-if="isPlaying" @click="isPlaying=false" icon="pause" size="2x" :style="{ color: 'white' }"/>
          <font-awesome-icon v-else @click="isPlaying=true" icon="play" size="2x" :style="{ color: 'white' }"/>
          <font-awesome-icon @click="stop" icon="stop" size="2x" :style="{ color: 'white' }"/>
        </div>
      </div>
      <div class="panel2">
        <div class="component">
          <label for="play-along">Play along</label>
          <input type="radio" id="play-along"
          name="mode" value="playAlong" v-model="mode">
          <label for="wait-input">Wait for input</label>
          <input type="radio" id="wait-input"
          name="mode" value="waitInput" v-model="mode">
        </div>
      </div>
      <div class="panel2">
        <div class="component">
          <label for="volume">Tempo: {{bpm}}bpm</label>
            <input v-model="rawBpm" type="range" id="volume" name="volume" min="1" max="240" step="1">
        </div>
      </div>
      <div class="panel2">
        <div class="component">
          <label for="volume">Loop</label>
          <input v-model="loopEnabled" type="checkbox" id="volume" name="volume" min="1" max="240" step="1">
          <input v-model="rawLoopStart" type="number" id="loop-start" name="loop-start" step="1">
          <input v-model="rawLoopEnd" type="number" id="loop-end" name="loop-end" step="1">
        </div>
      </div>
    </div>
    <div id="sheet">
      <runner ref="runner"
        :midiJson="midiJson"
        :height="sheetHeight"
        :width="sheetWidth"
        :keyWidth="keyWidth"
        :isPlaying="isPlaying"
        :bpm="bpm"
        :mode="mode"
        :loopEnabled="loopEnabled"
        :loopStart="loopStart"
        :loopEnd="loopEnd"
      >
      </runner>
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
      isPlaying: false,
      rawBpm: 120,
      mode: 'playAlong',
      stopClicked: false,
      loopEnabled: false,
      rawLoopStart: 2000,
      rawLoopEnd: 5000,
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
      this.rawBpm = this.midiJson.header.tempos[0].bpm;
    });
    this.reader.addEventListener('loadend', () => {
      console.log('Loaded midi file: ', this.midiJson);
      this.$refs.runner.parseMidi();
    });
  },
  computed: {
    octaveWidth() { return this.sheetWidth / this.octaveAmount; },
    keyWidth() { return this.octaveWidth / 12; },
    bpm() { return Math.round(Number(this.rawBpm)); },
    loopStart() { return Number(this.rawLoopStart); },
    loopEnd() { return Number(this.rawLoopEnd); },
  },
  methods: {
    readFile() {
      // triggers the load event!
      this.reader.readAsArrayBuffer(this.$refs.filereader.files[0]);
    },
    stop() {
      this.$emit('stop');
      this.isPlaying = false;
    },
  },
};
</script>

<style>
label {
  color: white;
  align-self: center;
  padding-left: 10px;
}
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

.panel {
  display: flex;
  flex-direction: column;
  border: solid 1px whitesmoke;
  justify-content: space-evenly;
  border-radius: 20px;
}
.panel2 {
  display: flex;
  border: solid 1px whitesmoke;
  justify-content: space-evenly;
  border-radius: 20px;
  padding: 20px;
}
.midi-player {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
</style>
