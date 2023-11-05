<template lang="pug">
#app
  #player
    #about
      h1(:style="{'margin-top': '0px'}")
        a(href='/') Play Piano Online
      label About The Author
      #icon-container
        a(target='_blank' href='https://github.com/Grkmus')
          font-awesome-icon(:icon="['fab', 'github']" size='2x')
        a(target='_blank' href='https://twitter.com/tosungo')
          font-awesome-icon(:icon="['fab', 'twitter']" size='2x')
        a(target='_blank' href='https://www.instagram.com/tosungo/')
          font-awesome-icon(:icon="['fab', 'instagram']" size='2x')
        a(target='_blank' href='https://gorkemtosun.com/')
          font-awesome-icon(:icon="['fa', 'globe']" size='2x')
    #player-options
      .module
        h3.panel-header Song
        .panel
          .container
            label(for='filereader')  Chose a midi file
            input#filereader(@change='readFile' type='file' name='filereader' ref='filereader' style='width: 140px')
          .container
            label(for='songs') Or pick a predefined song:
            select#songs(v-model='selectedSong' name='songs')
              option(label='Canon in D' value='Canon in D')
              option(label='Mozart - Rondo Alla Turca' value='Mozart - Rondo Alla Turca')
      .module
        h3.panel-header Player
        .panel
          font-awesome-icon(icon='step-backward' size='2x')
          font-awesome-icon(v-if='isPlaying' @click='isPlaying=false' icon='pause' size='2x')
          font-awesome-icon(v-else='' @click='isPlaying=true' icon='play' size='2x')
          font-awesome-icon(@click='stop' icon='stop' size='2x')
          font-awesome-icon(icon='step-forward' size='2x')
        span.truncate Current Song: {{ fileName || selectedSong }}
      .module
        h3.panel-header Mods
        .panel
          label(for='play-along') Play along
          input#play-along(type='radio' name='mode' value='playAlong' v-model='mode')
          label(for='wait-input') Wait for input
          input#wait-input(type='radio' name='mode' value='waitInput' v-model='mode')
          label(for='left-hand') Left Hand
          input#left-hand(type='checkbox' name='left-hand' value='leftHand' v-model='leftHandEnabled')
          label(for='right-hand') Right Hand
          input#right-hand(type='checkbox' name='left-hand' value='rightHand' v-model='rightHandEnabled')
      .module
        h3.panel-header Tempo
        .panel
          label(for='volume') {{bpm}}bpm
          input#tempo(v-model='rawBpm' type='range' name='tempo' min='1' max='240' step='1')
      .module
        h3.panel-header Looping
        .panel
          input#looping(v-model='loopEnabled' type='checkbox' name='looping' min='1' max='240' step='1')
          input#loop-start(v-model='rawLoopStart' type='number' name='loop-start' step='1000' :disabled='!loopEnabled' style='width: 50px')
          input#loop-end(v-model='rawLoopEnd' type='number' name='loop-end' step='1000' :disabled='!loopEnabled' style='width: 50px')
      .module
        h3.panel-header Midi Input
        .panel
          select#songs(v-model='selectedInput' name='songs')
            option(:key='input' v-html='input' :value='input' v-for='input in availableInputs')
  #sheet
    runner(
      ref='runner'
      :midiJson='midiJson'
      :height='sheetHeight'
      :width='sheetWidth'
      :keyWidth='keyWidth'
      :isPlaying='isPlaying'
      :bpm='bpm'
      :mode='mode'
      :loopEnabled='loopEnabled'
      :loopStart='loopStart'
      :loopEnd='loopEnd'
      :leftHandEnabled='leftHandEnabled'
      :rightHandEnabled='rightHandEnabled'
      @pause='isPlaying = false'
      :midi-device='midiDevice'
    )
  #keyboard
    octave(
      v-for='k in octaveAmount'
      :ref='k'
      :octaveWidth='octaveWidth'
      :octave='k'
      :keyWidth='keyWidth'
      :key='k'
    )
</template>

<script>
import WebMidi from 'webmidi';
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
      rawFileName: null,
      octaveAmount: 7,
      isPlaying: false,
      rawBpm: 120,
      mode: 'playAlong',
      loopEnabled: false,
      rawLoopStart: 2000,
      rawLoopEnd: 3000,
      publicPath: process.env.BASE_URL,
      predefinedSongs: [],
      selectedSong: 'Mozart - Rondo Alla Turca',
      leftHandEnabled: true,
      rightHandEnabled: true,
      selectedInput: null,
      availableInputs: null,
      midiDevice: null,
    };
  },

  mounted() {
    WebMidi.enable(() => {
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs);
      this.availableInputs = WebMidi.inputs.map((input) => input.name);
      this.selectedInput = this.availableInputs[0]; //eslint-disable-line
    });

    this.sheetHeight = this.$el.querySelector('#sheet').offsetHeight;
    this.sheetWidth = this.$el.querySelector('#sheet').offsetWidth;

    this.reader.addEventListener('onerror', (e) => {
      console.log('load different.', e);
    });
    this.reader.addEventListener('load', (e) => {
      // debugger;
      console.log('reading file', e.target.result);
      this.midiJson = new Midi(e.target.result);
      this.rawBpm = this.midiJson.header.tempos[0].bpm;
    });
    this.reader.addEventListener('loadend', () => {
      console.log('Loaded midi file: ', this.midiJson);
      this.$refs.runner.parseMidi();
    });
    fetch(`${this.publicPath}MozartWolfgangAmadeus_AllaTurcaRondo.midi`).then((res) => res.blob()).then((res) => {
      this.reader.readAsArrayBuffer(res);
      this.predefinedSongs.push({ name: 'Mozart - Rondo Alla Turca', blob: res });
    });
    fetch(`${this.publicPath}Canon_in_D.mid`).then((res) => res.blob()).then((res) => {
      this.predefinedSongs.push({ name: 'Canon in D', blob: res });
    });
  },
  watch: {
    selectedSong(newVal) {
      this.reader.readAsArrayBuffer(this.predefinedSongs.find((song) => song.name === newVal).blob);
      this.$refs.filereader.value = '';
      this.rawFileName = '';
    },

    mode(newValue) {
      if (newValue === 'playAlong') this.isPlaying = true;
    },

    selectedInput(newVal) {
      this.midiDevice = WebMidi.getInputByName(newVal);
    },
  },
  computed: {
    octaveWidth() { return this.sheetWidth / this.octaveAmount; },
    keyWidth() { return this.octaveWidth / 12; },
    bpm() { return Math.round(Number(this.rawBpm)); },
    loopStart() { return Number(this.rawLoopStart); },
    loopEnd() { return Number(this.rawLoopEnd); },
    fileName() { return this.rawFileName?.split('.')[0]; },
  },
  methods: {
    readFile() {
      // triggers the load event!
      this.isPlaying = false;
      this.reader.readAsArrayBuffer(this.$refs.filereader.files[0]);
      this.rawFileName = this.$refs.filereader.files[0].name;
    },
    stop() {
      this.$refs.runner.stop();
      this.isPlaying = false;
    },
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  justify-items: center;
}
#icon-container {
  display: flex;
  justify-content: space-evenly;
}
h1 {
  color: white;
  position: relative;
}
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
  margin-top: 0;
  height: 100%;
}
#player {
  display: flex;
  position: relative;
  height: 10%;
  justify-content: space-around;
  background: #2c3e50;
  z-index: 1;
}
#player-options {
  position: relative;
  display: flex;
  justify-content: center;
  background: #2c3e50;
  z-index: 1;
  flex-wrap: wrap;
}
#sheet {
  display: flex;
  height: 75%;
  width: 100%;
}
#keyboard {
  display: flex;
  width: 100%;
  height: 15%;
  color: #2c3e50;
}

html, body {
  background-color: rgb(59, 54, 54);
  color: white;
  margin: 0;
  padding: 0;
  height: 100%;
  font-size: 0.5vw;
}

#about {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

input {
  font-size: 0.5vw;
}
select {
  font-size: 0.5vw;
}

.module {
  border: solid 1px whitesmoke;
  border-radius: 10px;
  padding: 5px;
  margin: 5px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.panel {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin: 5px;
  height: 100%;
}
.panel-header {
  padding: 2px;
  margin: 0px;
  border-bottom: 1px groove
}

.truncate {
  width: 10vw;
  white-space: nowrap;
  overflow: hidden;
  display:block;
  padding-bottom: 8px;
  text-overflow: ellipsis
}

a, a:visited, a:hover, a:active {
  color: inherit;
  text-decoration: none !important;
}
</style>
