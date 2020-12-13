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
  },
  data() {
    return {
      tempo: 5,
      notes: {},
      keys: {},
      lowestKey: 36,
      isKeyPressed: false,
      isKeyBeingPressed: false,
      sketch: null,
      standardQuarterNoteHeight: 240,
      position: 0,
      currentTick: 0,
      notesOnStage: [],
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
    });
  },
  computed: {
    green() { return [52, 206, 77]; },
    red() { return [213, 7, 76]; },
    blue() { return [3, 132, 252]; },
    keyTriggerArea() { return this.height - this.keyPressMargin; },
    keyPressMargin() { return this.tempo * 5; },
    allNotes() { return _.flatMapDeep(this.midiJson.tracks, (track) => [track.notes]); },

    // need to round up the minimum measure as it should be multiple of 20 which means 1/16 note
    minimumMeasure() { return Math.ceil(_.minBy(this.allNotes, (note) => note.durationTicks).durationTicks / 20) * 20; },
    scaledMinMeasure() { return this.minimumMeasure * this.divisionRate; },

    startTick() { return _.minBy(this.allNotes, (note) => note.ticks).ticks; },
    lastTick() { return _.maxBy(this.allNotes, (note) => note.ticks).ticks; },
    availableKeys() { return new Set(this.allNotes.map((note) => note.midi)); },
    divisionRate() { return this.standardQuarterNoteHeight / this.midiJson.header.ppq; },
    adjustedPosition() { return this.position % this.height; },
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
      if (this.position % this.scaledMinMeasure === 0) {
        this.sketch.noLoop();
        this.currentTick += 1;
        console.log('new tick!', this.currentTick);
        this.availableKeys.forEach((key) => {
          const note = this.notes[key][this.currentTick];
          if (note) this.notesOnStage.push(note);
        });
      }
    },

    drawNotes() {
      this.pushNoteOnStage();

      this.notesOnStage.forEach((note) => {
        // three phases for each note after they appear in the stage
        // 1. note start
        // - the point where the y value of note is equals with screen height
        // 2. note being played
        // 3. note stop
        if (this.isNoteStart(note)) {
          this.sketch.noLoop();
          note.isOpen = true;
          this.noteOn(note);
          this.sketch.fill(this.red);
          this.sketch.rect(note.x, this.height - this.position, this.keyWidth, -10);
          console.log('checking the key..', note);
          // if (this.keys[note.number]) {
          if (this.isKeyPressed) {
            note.color = this.green;
            this.sketch.loop();
          }
        }
        this.sketch.fill(note.color);
        this.sketch.rect(note.x, note.y, this.keyWidth, note.h, 5);
        if (note.isOpen) {
          this.sketch.fill(this.red);
          this.sketch.rect(note.x, this.height - this.position, this.keyWidth, -10);
        }

        if (this.position + note.y + note.h > this.height && note.isOpen) {
          note.isOpen = false;
          this.noteOff(note);
        }
      });
    },
    drawDivisions() {
      for (let i = 0; i < this.height; i += this.scaledMinMeasure) {
        this.sketch.line(0, i, this.width, i);
      }
    },
    playMidi() {
      this.fillNotes();
      this.midiJson.tracks.forEach((track) => {
        console.log('parsing tracks..');
        track.notes.forEach((note) => {
          console.log('parsing notes..');
          const {
            midi, durationTicks, ticks, octave, pitch,
          } = note;
          const adjustedHeight = durationTicks * this.divisionRate;
          const adjustedStart = -ticks * this.divisionRate;
          console.log('the tick: ', ticks);
          console.log('to slot: ', Math.floor(ticks / this.minimumMeasure));
          this.notes[midi][Math.floor(ticks / this.minimumMeasure)] = {
            number: midi,
            octave,
            name: pitch,
            color: [255, 255, 255],
            velocity: 0,
            x: (midi - this.lowestKey) * this.keyWidth,
            y: adjustedStart,
            h: -adjustedHeight,
            isOpen: false,
          };
        });
      });
      this.sketch.loop();
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
    isNoteStart(note) {
      const positionY = note.y + this.position;
      return (this.height - this.keyPressMargin) < positionY && positionY < this.height;
    },
    isKeyNeedPressed(note) {
      return note.y > this.height && note.y + note.h < this.height;
    },
    render() {
      const sketch = (s) => {
        s.noLoop();
        s.setup = () => {
          s.createCanvas(this.width, this.height);
        };
        s.draw = () => {
          s.background(33, 33, 33);
          this.drawDivisions(s);
          s.translate(0, this.position += this.tempo);
          this.drawNotes(s);
        };
        this.sketch = s;
      };
      new P5(sketch, 'canvas');
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
  },
};
</script>
