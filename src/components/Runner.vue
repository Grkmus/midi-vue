<template lang="pug">
  canvas(ref="sheet")
</template>

<script>
/* eslint-disable no-unused-vars */
import P5 from 'p5';
import _ from 'lodash';
import Sketch from './Sketch';

export default {
  name: 'Runner',
  props: {
    width: null,
    height: null,
    keyWidth: null,
    midiJson: null,
    isPlaying: Boolean,
    bpm: Number,
    mode: String,
    loopEnabled: Boolean,
    loopStart: Number,
    loopEnd: Number,
    leftHandEnabled: Boolean,
    rightHandEnabled: Boolean,
    midiDevice: Object,
  },
  data() {
    this.cachedNotes = null;
    return {
      stage: [],
      notesGrouped: null,
      keys: {},
      lowestKey: 24,
      isKeyPressed: false,
      isKeyBeingPressed: false,
      sketch: null,
      standardQuarterNoteHeight: 240,
      notes: [],
      position: 0,
      deltaTime: 0,
      keysToBePressed: new Set(),
      bpmScaler: 1,
    };
  },
  mounted() {
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    window.addEventListener('load', () => {
      // console.log('page is fully loaded');
      // console.log(getSettings());
      this.createKeys();
    });
    this.$parent.$on('stop', this.stop);
  },
  computed: {
    // need to round up the minimum measure as it should be multiple of 20 which means 1/16 note
    bpm2px() { return (this.bpm * 4) / (1000 / this.deltaTime); },
    positionAdder() { return this.bpm2px * this.bpmScaler; },
  },
  watch: {
    // need to add listeners again whenever the device changes
    midiDevice() {
      this.midiDevice.addListener('noteon', 'all', (e) => {
        console.log(e);
        const { note } = e;
        this.$set(this.keys, note.number, true);
        this.keysToBePressed.delete(note.number);
        if (!this.keysToBePressed.size && this.mode === 'waitInput') this.$parent.isPlaying = true;
        this.noteOn(note);
      });
      this.midiDevice.addListener('noteoff', 'all', (e) => {
        console.log(e);
        const { note } = e;
        this.$set(this.keys, note.number, false);
        this.noteOff(note);
      });
    },

    isKeyPressed(newVal) {
      console.log('isKeypressed');
      console.log(newVal);
    },

    isKeyBeingPressed(newVal) {
      console.log('isKeyBeingPressed');
      console.log(newVal);
    },

    loopEnabled(newVal) {
      if (newVal) this.setupForLoop();
      else {
        this.$set(this, 'notes', this.cachedNotes.filter((note) => Math.abs(note.position) > this.position - this.height));
        this.resetNoteState();
      }
    },

    loopStart() {
      this.setupForLoop();
    },

    loopEnd() {
      this.setupForLoop();
    },

    isPlaying(newVal) {
      if (newVal) this.bpmScaler = 1;
      else this.bpmScaler = 0;
    },

    mode(newValue) {
      if (newValue === 'playAlong') this.keysToBePressed.clear();
    },
  },

  methods: {
    createKeys() {
      for (let i = this.lowestKey; i < 108; i += 1) {
        this.$set(this.keys, i, false);
      }
    },

    stop() {
      this.position = 0;
      this.$set(this, 'notes', _.cloneDeep(this.cachedNotes));
      this.resetNoteState();
    },

    resetNoteState() {
      this.piano.stopAll();
      this.notes.forEach((note) => {
        note.isOpen = false;
        note.color = this.pickColor(note.hand, note.name);
      });
      this.$root.$emit('reset');
    },

    loopInArea() {
      if (this.position >= this.loopEnd + this.height) {
        this.setupForLoop();
      }
    },

    setupForLoop() {
      this.$set(this, 'notes', this.cachedNotes.filter((note) => Math.abs(note.position) > this.loopStart && Math.abs(note.position) < this.loopEnd));
      this.resetNoteState();
      this.position = this.loopStart + this.height;
    },

    setTheStage(withNotes) {
      this.stage = [...Object.values(withNotes).slice(0, 2)];
    },

    pressKeyComponent(octave, pitch, midiNumber) {
      this.$parent.$refs[octave][0].$refs[pitch].pressKey(55, midiNumber);
    },

    releaseKeyComponent(octave, pitch, midiNumber) {
      this.$parent.$refs[octave][0].$refs[pitch].releaseKey(midiNumber);
    },
  },
};
</script>
