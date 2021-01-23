<template>
  <div id="canvas"></div>
</template>

<script>
import P5 from 'p5';
import { Piano } from '@tonejs/piano';
import _ from 'lodash';
import ASharpImage from '../assets/A#.png';
import CSharpImage from '../assets/C#.png';
import DSharpImage from '../assets/D#.png';
import FSharpImage from '../assets/F#.png';
import GSharpImage from '../assets/G#.png';
import AImage from '../assets/A.png';
import BImage from '../assets/B.png';
import CImage from '../assets/C.png';
import DImage from '../assets/D.png';
import EImage from '../assets/E.png';
import FImage from '../assets/F.png';
import GImage from '../assets/G.png';

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
    showNoteText: Boolean,
  },
  data() {
    this.cachedNotes = null;
    return {
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
      this.sketchIt();
      this.createKeys();
    });
    this.$parent.$on('stop', this.stop);
    this.initializePianoSamples();
  },
  computed: {
    green() { return [52, 206, 77]; },
    darkGreen() { return [50, 117, 61]; },
    red() { return [245, 22, 22]; },
    darkRed() { return [128, 38, 38]; },
    blue() { return [3, 132, 252]; },
    darkBlue() { return [59, 96, 133]; },
    gray() { return [138, 138, 138]; },
    keyTriggerLocation() { return this.height - this.bpm2px; },
    keyOffLocation() { return this.height + this.bpm2px; },
    rawAllNotes() { return _.flatMapDeep(this.midiJson?.tracks, (track) => [track.notes]); },
    // need to round up the minimum measure as it should be multiple of 20 which means 1/16 note
    minimumMeasure() { return Math.ceil(_.minBy(this.rawAllNotes, (note) => note?.durationTicks)?.durationTicks / 20) * 20; },
    scaledMinMeasure() { return this.minimumMeasure * this.divisionRate; },
    startTick() { return _.minBy(this.rawAllNotes, (note) => note.ticks).ticks; },
    lastTick() { return _.maxBy(this.rawAllNotes, (note) => note.ticks).ticks; },
    availableKeys() { return new Set(this.rawAllNotes.map((note) => note.midi)); },
    divisionRate() { return this.standardQuarterNoteHeight / this.midiJson?.header.ppq; },
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

    initializePianoSamples() {
      this.piano = new Piano({ velocities: 2 });
      this.piano.toDestination();
      this.piano.output.gain.value = 0.5;
      this.piano.load().then(() => {
        console.log('loaded!');
      });
    },

    createKeys() {
      for (let i = this.lowestKey; i < 108; i += 1) {
        this.$set(this.keys, i, false);
      }
    },

    pickMode(note, i) {
      if (this.mode === 'waitInput') {
        note.isOpen = true;
        this.keysToBePressed.add(note.number);
        console.log(this.keysToBePressed);
        this.pressKeyComponent(note.octave, note.name);
        this.$emit('pause');
      }
      if (this.mode === 'playAlong') {
        note.isOpen = true;
        this.$set(this.notes, i, note);
        this.noteOn(note, i);
        console.log('note started', note, i);
      }
    },

    drawNotes() {
      for (let i = this.notes.length - 1; i >= 0; i -= 1) {
        const note = this.notes[i];
        // coloring
        this.sketch.fill(this.gray);
        if (this.leftHandEnabled && note.hand === 'left') this.sketch.fill(note.color);
        if (this.rightHandEnabled && note.hand === 'right') this.sketch.fill(note.color);
        note.show();
        if (this.showNoteText) note.write();
        if (note.isNoteStart() && !note.isOpen) {
          console.log('fill with ');
          note.color = this.darkBlue;
          if (this.leftHandEnabled && note.hand === 'left') {
            this.pickMode(note, i);
          }
          if (this.rightHandEnabled && note.hand === 'right') {
            this.pickMode(note, i);
          }
        }
        if (note.isOpen) note.showEffect(this.position);

        if (note.isNoteEnd()) {
          note.isOpen = false;
          this.notes.splice(i, 1);
          this.noteOff(note, i);
          console.log('note ended', note, i);
        }
      }
    },

    noteOn(note) {
      console.log('Note ON: ', note);
      this.piano.keyDown({ midi: note.number });
      this.pressKeyComponent(note.octave, note.name);
    },

    noteOff(note) {
      console.log('Note OFF: ', note);
      this.piano.keyUp({ midi: note.number });
      this.releaseKeyComponent(note.octave, note.name);
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
      this.position = 0;
      this.$set(this, 'notes', []); // in case the user chose a new file while a song is playing
      this.resetNoteState();
      this.midiJson.tracks.forEach((track, index) => {
        console.log('parsing tracks..');
        track.notes.forEach((note) => {
          console.log('parsing notes..');
          const {
            midi, durationTicks, ticks, octave, pitch,
          } = note;
          const adjustedHeight = -durationTicks * this.divisionRate;
          const adjustedStart = -ticks * this.divisionRate;
          const offset = this.getOffset(note);
          const [x, y, w, h] = [((midi - this.lowestKey) * this.keyWidth) + offset, adjustedStart, this.keyWidth, adjustedHeight];
          const hand = index === 1 ? 'left' : 'right';
          this.notes.push({
            hand,
            number: midi,
            octave,
            name: pitch,
            color: this.pickColor(hand, pitch),
            velocity: 0,
            isOpen: false,
            position: y,
            show: () => this.sketch.rect(x, y, w, h, 5),
            write: this.sketch.imagePicker(pitch, x, y),
            isNoteStart: () => this.height <= y + this.position,
            isNoteEnd: () => this.keyTriggerLocation <= y + h + this.position,
            showEffect: this.sketch.effectGenerator(x + this.keyWidth / 2, 5),
          });
        });
        this.cachedNotes = _.cloneDeep(this.notes);
      });
    },

    getOffset(note) {
      const offsets = {
        'C#': 2,
        'D#': 4,
        'F#': 6,
        'G#': 4,
        G: 5,
        A: 3,
        E: 3,
        F: 5,
        D: 5,
      };
      return _.get(offsets, note.pitch, 0);
    },

    pickColor(hand, noteName) {
      const colorOptions = {
        // for each option: [condition, result]
        rightHandSharp: [hand === 'right' && noteName.includes('#'), this.darkRed],
        leftHandSharp: [hand === 'left' && noteName.includes('#'), this.darkGreen],
        rightHand: [hand === 'right', this.red],
        leftHand: [hand === 'left', this.green],
      };
      return Object.values(colorOptions).find((options) => options[0])[1];
    },

    pressKeyComponent(octave, pitch) {
      this.$parent.$refs[octave][0].$refs[pitch].pressKey(55);
    },

    releaseKeyComponent(octave, pitch) {
      this.$parent.$refs[octave][0].$refs[pitch].releaseKey();
    },

    sketchIt() {
      const sketch = (s) => {
        const images = {
          'A#': ASharpImage,
          'C#': CSharpImage,
          'D#': DSharpImage,
          'F#': FSharpImage,
          'G#': GSharpImage,
          A: AImage,
          B: BImage,
          C: CImage,
          D: DImage,
          E: EImage,
          F: FImage,
          G: GImage,
        };
        const loadedImages = {};
        s.preload = () => {
          console.log('Loading images', loadedImages);
          Object.entries(images).forEach(([key, value]) => {
            loadedImages[key] = s.loadImage(value);
          });
          console.log('Images Loaded!', loadedImages);
          console.log('normal images', images);
        };

        s.imagePicker = (imageName, x, y) => {
          console.log('setting the image picker function for', imageName);
          return () => {
            const image = _.get(loadedImages, imageName);
            // console.log(imageName, image, loadedImages);
            s.image(image, x, y - 30);
          };
        };

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
          if (this.loopEnabled) this.loopInArea();
          this.drawNotes(s);
          if (this.isPlaying) {
            this.deltaTime = s.deltaTime;
            this.position += this.positionAdder;
          }
          s.textSize(32);
          s.fill(255);
          s.text(Math.round(this.position) - this.height, 30, 60 - this.position);
        };
        this.sketch = s;
      };
      new P5(sketch, 'canvas');
    },
  },
};
</script>
