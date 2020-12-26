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
    bpm: Number,
    mode: String,
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
      notesOnStage: [],
      position: 0,
      currentTick: 0,
      deltaTime: 0,
      keysToBePressed: [],
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
          const noteIndex = this.keysToBePressed.indexOf(note.number);
          if (noteIndex !== -1) { this.keysToBePressed.splice(noteIndex, 1); }
          if (!this.keysToBePressed.length) this.sketch.loop();
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
    keyTriggerLocation() { return this.height - this.bpm2px; },
    allNotes() { return _.flatMapDeep(this.midiJson?.tracks, (track) => [track.notes]); },

    // need to round up the minimum measure as it should be multiple of 20 which means 1/16 note
    minimumMeasure() { return Math.ceil(_.minBy(this.allNotes, (note) => note?.durationTicks)?.durationTicks / 20) * 20; },
    scaledMinMeasure() { return this.minimumMeasure * this.divisionRate; },
    startTick() { return _.minBy(this.allNotes, (note) => note.ticks).ticks; },
    lastTick() { return _.maxBy(this.allNotes, (note) => note.ticks).ticks; },
    availableKeys() { return new Set(this.allNotes.map((note) => note.midi)); },
    divisionRate() { return this.standardQuarterNoteHeight / this.midiJson?.header.ppq; },
    bpm2px() { return (this.bpm * 4) / (1000 / this.deltaTime); },
  },
  watch: {
    isKeyPressed(newVal) {
      console.log('isKeypressed');
      console.log(newVal);
    },

    isKeyBeingPressed(newVal) {
      console.log('isKeyBeingPressed');
      console.log(newVal);
    },
  },
  methods: {

    initializePianoSamples() {
      this.piano = new Piano({ velocities: 2 });
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

    fillSlots() {
      for (let tick = 0; tick < this.lastTick; tick += this.minimumMeasure) {
        this.availableKeys.forEach((key) => {
          this.notes[key].push(false);
        });
      }
    },

    pushNoteOnStage() {
      this.currentTick += 1;
      this.availableKeys.forEach((key) => {
        const note = this.notes[key][this.currentTick];
        if (note) {
          this.notesOnStage.push(note);
        }
      });
    },

    drawNotes() {
      for (let i = this.notesOnStage.length - 1; i >= 0; i -= 1) {
        const note = this.notesOnStage[i];
        note.show();
        if (note.isNoteStart() && !note.isOpen) {
          if (this.mode === 'waitInput') {
            this.keysToBePressed.push(note.number);
            this.pressKeyComponent(note.octave, note.name);
            this.$set(this, 'isPlaying', false);
          }
          if (this.mode === 'playAlong') {
            note.isOpen = true;
            this.$set(this.notesOnStage, i, note);
            this.noteOn(note, i);
            console.log('note started', note, i);
          }
        }
        if (note.isNoteEnd()) {
          this.notesOnStage.splice(i, 1);
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

    drawDivisions() {
      for (let i = 0; i < this.width; i += this.keyWidth) {
        this.sketch.line(i, 0, i, this.height);
      }
    },

    parseMidi() {
      this.fillSlots();
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
            show: () => this.sketch.rect(x, y, w, h, 5),
            isNoteStart: () => this.keyTriggerLocation <= y + this.position,
            isNoteEnd: () => this.keyTriggerLocation <= y + h + this.position,
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

    render() {
      const sketch = (s) => {
        s.setup = () => {
          s.createCanvas(this.width, this.height);
        };
        s.draw = () => {
          s.background(33, 33, 33);
          this.drawDivisions(s);
          s.translate(0, this.position);
          this.drawNotes(s);
          if (this.isPlaying) {
            this.pushNoteOnStage();
            this.deltaTime = s.deltaTime;
            this.position += this.bpm2px;
          }
        };
        this.sketch = s;
      };
      new P5(sketch, 'canvas');
    },
  },
};
</script>
