<template>
  <div id="canvas"></div>
</template>

<script>
import WebMidi from 'webmidi';
import P5 from 'p5';
import { Piano } from '@tonejs/piano';
import _ from 'lodash';

export default {
  name: 'Runner',
  props: {
    width: null,
    height: null,
    keyWidth: null,
    midiJson: null,
    isPlaying: Boolean,
    tempo: Number,
  },
  data() {
    return {
      notes: {},
      keys: {},
      lowestKey: 36,
      isKeyPressed: false,
      isKeyBeingPressed: false,
      sketch: null,
      standardQuarterNoteHeight: 240,
      position: -this.tempo,
      currentTick: 0,
      notesOnStage: [],
      frameCounter: 0,
    };
  },
  mounted() {
    this.createNotes();
    this.render();
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    this.initializePianoSamples();
    WebMidi.enable(() => {
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs);
      this.midiDevice = WebMidi.getInputByName('GO:KEYS');
      if (this.midiDevice) {
        this.midiDevice.addListener('noteon', 'all', (e) => {
          console.log(e);
          const { note } = e;
          this.$set(this.keys, note.number, true);
          this.noteOn(note);
        });
        this.midiDevice.addListener('noteoff', 'all', (e) => {
          console.log(e);
          const { note } = e;
          this.$set(this.keys, note.number, false);
          this.noteOff(note);
        });
      }
    });
  },
  computed: {
    green() { return [52, 206, 77]; },
    red() { return [213, 7, 76]; },
    blue() { return [3, 132, 252]; },
    keyTriggerArea() { return this.height - this.keyPressMargin; },
    keyPressMargin() { return this.tempo; },
    allNotes() { return _.flatMapDeep(this.midiJson?.tracks, (track) => [track.notes]); },

    // need to round up the minimum measure as it should be multiple of 20 which means 1/16 note
    minimumMeasure() { return Math.ceil(_.minBy(this.allNotes, (note) => note?.durationTicks)?.durationTicks / 20) * 20; },
    scaledMinMeasure() { return this.minimumMeasure * this.divisionRate; },
    startTick() { return _.minBy(this.allNotes, (note) => note.ticks).ticks; },
    lastTick() { return _.maxBy(this.allNotes, (note) => note.ticks).ticks; },
    availableKeys() { return new Set(this.allNotes.map((note) => note.midi)); },
    divisionRate() { return this.standardQuarterNoteHeight / this.midiJson?.header.ppq; },
  },
  watch: {
    isPlaying(newVal) {
      if (newVal === false) this.sketch.noLoop();
      else this.sketch.loop();
    },
    isKeyPressed(newVal) {
      console.log('isKeypressed');
      console.log(newVal);
    },
    isKeyBeingPressed(newVal) {
      console.log('isKeyBeingPressed');
      console.log(newVal);
    },
    tempo() {
      this.frameCounter = 0;
    },
  },
  methods: {

    initializePianoSamples() {
      this.piano = new Piano({
        velocities: 2,
      });
      this.piano.toDestination();
      this.piano.load().then(() => {
        console.log('loaded!');
      });
    },

    createNotes() {
      for (let i = this.lowestKey; i < 127; i += 1) {
        this.$set(this.notes, i, []);
        this.$set(this.keys, i, false);
      }
    },

    fillNotes() {
      for (let tick = 0; tick < this.lastTick; tick += this.minimumMeasure) {
        this.availableKeys.forEach((key) => {
          this.notes[key].push(false);
        });
      }
    },

    pushNoteOnStage() {
      // when it time to a new tick, put the notes on stage:
      if (this.frameCounter % Math.floor(this.scaledMinMeasure / this.tempo) === 0) {
        this.currentTick += 1;
        console.log('new tick!', this.currentTick);
        this.availableKeys.forEach((key) => {
          const note = this.notes[key][this.currentTick];
          console.log('pushing the note on!', note);
          if (note) this.notesOnStage.push(note);
        });
      }
    },

    drawNotes() {
      this.pushNoteOnStage();

      this.notesOnStage.forEach((note) => {
        note.show();
        if (note.isNoteStart()) {
          console.log('checking the key..', note);
          this.noteOn(note);
        }

        if (note.isNoteEnd() && note.isOpen) {
          this.noteOff(note);
        }
      });
    },

    drawDivisions() {
      for (let i = 0; i < this.width; i += this.keyWidth) {
        this.sketch.line(i, 0, i, this.height);
      }
    },
    parseMidi() {
      this.fillNotes();
      this.midiJson.tracks.forEach((track) => {
        console.log('parsing tracks..');
        track.notes.forEach((note) => {
          console.log('parsing notes..');
          const {
            midi, durationTicks, ticks, octave, pitch,
          } = note;
          const adjustedHeight = -durationTicks * this.divisionRate;
          const adjustedStart = -ticks * this.divisionRate;
          const slot = Math.floor(ticks / this.minimumMeasure);
          // note's dimensions to sketch
          const [x, y, w, h] = [(midi - this.lowestKey) * this.keyWidth, adjustedStart, this.keyWidth, adjustedHeight];
          this.notes[midi][slot] = {
            number: midi,
            octave,
            name: pitch,
            color: [255, 255, 255],
            velocity: 0,
            isOpen: false,
            show: () => (this.sketch.rect(x, y, w, h, 5)),
            isNoteStart: () => (this.height - this.keyPressMargin) < y + this.position && y + this.position < this.height,
            isNoteEnd: () => (this.position + y + h > this.height),
          };
        });
      });
    },
    pressKeyComponent(octave, pitch) {
      this.$parent.$refs[octave - 1][0].$refs[pitch].pressKey(55);
    },
    releaseKeyComponent(octave, pitch) {
      this.$parent.$refs[octave - 1][0].$refs[pitch].releaseKey();
    },
    keyDown(e) {
      console.log(e.code);
      this.isKeyPressed = true;
      // this.sketch.loop();
      this.$emit('key-down');
    },
    keyUp() {
      // this.sketch.noLoop();
      this.isKeyPressed = false;
      this.$emit('key-up');
    },
    isKeyNeedPressed(note) {
      return note.y > this.height && note.y + note.h < this.height;
    },
    render() {
      const sketch = (s) => {
        s.setup = () => {
          s.createCanvas(this.width, this.height);
          s.noLoop();
        };
        s.draw = () => {
          s.background(33, 33, 33);
          this.drawDivisions(s);
          this.frameCounter += this.tempo;
          s.translate(0, this.position += this.tempo);
          this.drawNotes(s);
        };
        this.sketch = s;
      };
      new P5(sketch, 'canvas');
    },
    noteOn(note) {
      note.isOpen = true;
      console.log('Note ON: ', note);
      this.piano.keyDown({ midi: note.number });
      this.pressKeyComponent(note.octave, note.name);
    },
    noteOff(note) {
      note.isOpen = false;
      console.log('Note OFF: ', note);
      this.piano.keyUp({ midi: note.number });
      this.releaseKeyComponent(note.octave, note.name);
    },
  },
};
</script>
