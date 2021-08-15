<template lang="pug">
#canvas
</template>

<script>
import P5 from 'p5';
import _ from 'lodash';
import Note from '../models/Note';
import getSettings from '../utils/settings';

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
      console.log('page is fully loaded');
      console.log(getSettings());
      this.sketchIt();
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

    parseMidi() {
      console.log('PARSING THE MIDI FILE...');
      this.midiJson.tracks.forEach((track, trackIndex) => {
        track.notes.forEach((note, noteIndex) => {
          this.notes.push(
            new Note(note, noteIndex, trackIndex, this.height, this.pressKeyComponent, this.releaseKeyComponent),
          );
          this.notesGrouped = _.groupBy(this.notes, (note) => Math.floor(-note.y / this.height)); // eslint-disable-line
        });
      });
      this.stage.push(...Object.values(this.notesGrouped).slice(0, 2));
      console.log(this.notesGrouped);
      this.cachedNotes = _.cloneDeep(this.notesGrouped);
    },

    pressKeyComponent(octave, pitch, midiNumber) {
      console.log('press key', octave, pitch);
      this.$parent.$refs[octave - 1][0].$refs[pitch].pressKey(55, midiNumber);
    },

    releaseKeyComponent(octave, pitch, midiNumber) {
      console.log('release key');
      this.$parent.$refs[octave - 1][0].$refs[pitch].releaseKey(midiNumber);
    },

    sketchIt() {
      const sketch = (s) => {
        s.effectGenerator = (x, pace) => {
          let i = 0;
          const { keyWidth } = this;
          const { height } = this;
          const { darkBlue } = this;
          return (position) => {
            if (i < keyWidth - 10) {
              s.rectMode(s.CORNERS);
              s.fill(...darkBlue, 100);
              s.rect(x + i, 0 - position, x - i, height - position);
              s.rectMode(s.CORNER);
              i += pace;
            }
          };
        };

        s.setup = () => {
          s.createCanvas(this.width, this.height);
        };
        s.draw = () => {
          s.background(33, 33, 33);
          s.translate(0, this.position);
          this.stage.forEach((group, index) => {
            for (let i = group.length - 1; i >= 0; i -= 1) {
              const note = group[i];
              note.update(this.position);
              if (note.isPlayed) group.splice(i, 1);
              if (group.length === 0) {
                console.log('this group is finished', index);
                console.log('retrieving next group', index + 2);
                this.stage.push(this.notesGrouped[index + 2]);
              }
            }
          });
          s.text(this.stage.flat().length, 30, 30 - this.position);
          s.text(this.position, 30, 60 - this.position);
          if (this.isPlaying) {
            this.deltaTime = s.deltaTime;
            this.position += this.positionAdder;
          }
        };
        this.sketch = s;
        Note.prototype.sketch = s;
        Note.prototype.settings = getSettings();
        console.log(Note.prototype);
      };
      new P5(sketch, 'canvas');
    },
  },
};
</script>
