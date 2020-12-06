<template>
  <div id="canvas"></div>
</template>

<script>
import WebMidi from 'webmidi';
import P5 from 'p5';
import { Midi } from 'tone';
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
      highestKey: 96,
      noteScaleFactor: 1,
      isKeyPressed: false,
      isKeyBeingPressed: false,
      sketch: null,
      synth: null,
      noteOns: new Set(),
      standardQuarterNote: 240,
    };
  },
  mounted() {
    this.createNotes();
    this.render();
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    this.piano = new Piano({
      velocities: 2,
    });
    this.piano.toDestination();
    this.piano.load().then(() => {
      console.log('loaded!');
    });
    WebMidi.enable(() => {
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs);
      this.midiDevice = WebMidi.getInputByName('GO:KEYS');
      this.midiDevice.addListener('noteon', 'all', (e) => {
        console.log(e);
        this.noteOn(e.note.number);
      });
      this.midiDevice.addListener('noteoff', 'all', (e) => {
        console.log(e);
        this.noteOff(e.note.number);
      });
    });
  },
  computed: {
    green() { return [52, 206, 77]; },
    red() { return [213, 7, 76]; },
    blue() { return [3, 132, 252]; },
    keyTriggerArea() { return this.height - this.keyPressMargin; },
    keyPressMargin() { return this.tempo * 5; },
    minimumMeasure() {
      const allNotes = _.flatMapDeep(this.midiJson.tracks, (track) => [track.notes]);
      return Math.ceil(_.minBy(allNotes, (note) => note.durationTicks).durationTicks / 20) * 20;
    },
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
    createNotes() {
      for (let i = this.lowestKey; i < this.highestKey; i += 1) {
        this.$set(this.notes, i, []);
        this.$set(this.keys, i, false);
      }
    },
    drawNotes() {
      for (let i = this.lowestKey; i < this.highestKey; i += 1) {
        const availableNotes = this.notes[i];
        for (let k = 0; k < availableNotes.length; k += 1) {
          const note = availableNotes[k];
          if (this.isKeyNeedTrigger(note) && this.keys[i]) note.color = this.green;
          else if (this.isKeyNeedTrigger(note) && !this.keys[i]) note.color = this.red;
          this.sketch.rect(this.getPositionX(i), note.y, this.keyWidth, note.h);
        }
      }
    },
    drawDivisions() {
      for (let i = 0; i < this.height; i += this.minimumMeasure) {
        this.sketch.line(0, i, this.width, i);
      }
    },
    playMidi() {
      const division = this.standardQuarterNote / this.midiJson.header.ppq;
      this.midiJson.tracks.forEach((track) => {
        track.notes.forEach((note) => {
          const { midi, durationTicks, ticks } = note;
          this.parseNote(midi, durationTicks * division, ticks);
        });
      });
      this.sketch.loop();
    },
    parseNote(noteNumber, durationTick, currentTick) {
      const adjustedHeight = Math.round(durationTick / this.noteScaleFactor);
      const adjustedStart = Math.round(-currentTick / this.noteScaleFactor);
      this.$set(this.notes, noteNumber, [
        ...this.notes[noteNumber],
        {
          noteName: Midi(noteNumber).toNote(),
          color: [255, 255, 255],
          velocity: 0,
          y: adjustedStart,
          h: -adjustedHeight,
          isOpen: false,
        },
      ]);
    },
    getPositionX(noteNumber) {
      return (noteNumber - this.lowestKey) * this.keyWidth;
    },
    keyDown() {
      this.sketch.noLoop();
      // this.$set(this.keys, noteNumber, true);
    },
    keyUp() {
      this.sketch.loop();
      // this.$set(this.keys, noteNumber, false);
    },
    isKeyNeedTrigger(note) {
      return (this.height - this.keyPressMargin) < note.y && note.y < this.height; //eslint-disable-line
    },
    isKeyNeedPressed(note) {
      return note.y > this.height && note.y + note.h < this.height;
    },
    render() {
      let position = 0;
      const sketch = (s) => {
        s.noLoop();
        s.setup = () => { // eslint-disable-line
          s.createCanvas(this.width, this.height);
        };
        s.draw = () => { // eslint-disable-line
          s.background(33, 33, 33);
          this.drawDivisions(s);
          // s.line(0, this.keyTriggerArea, this.width, this.keyTriggerArea, 0, 0);
          //eslint-disable-line
          s.translate(0, position += this.tempo);
          this.drawNotes(s);
        };
        this.sketch = s;
      };
      new P5(sketch, 'canvas'); //eslint-disable-line
    },
    noteOn(noteNumber) {
      console.log('Note ON: ', noteNumber);
      this.$set(this.keys, noteNumber, true);
      this.piano.keyDown({ note: Midi(noteNumber).toNote() });
    },
    noteOff(noteNumber) {
      this.$set(this.keys, noteNumber, false);
      this.piano.keyUp({ note: Midi(noteNumber).toNote() });
    },
  },
};
</script>
