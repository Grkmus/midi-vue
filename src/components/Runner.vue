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
    allNotes() {
      return _.flatMapDeep(this.midiJson.tracks, (track) => [track.notes]);
    },
    minimumMeasure() {
      return Math.ceil(
        _.minBy(this.allNotes, (note) => note.durationTicks).durationTicks / 20,
      )
        * 20;
    },
    scaledMinMeasure() {
      return this.minimumMeasure * this.divisionRate;
    },
    lastTick() {
      return _.maxBy(this.allNotes, (note) => note.ticks).ticks;
    },
    availableKeys() {
      return new Set(this.allNotes.map((note) => note.midi));
    },
    divisionRate() {
      return this.standardQuarterNoteHeight / this.midiJson.header.ppq;
    },
    adjustedPosition() {
      return this.position % this.height;
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
    fillNotes() {
      for (let tick = 0; tick < this.lastTick; tick += this.minimumMeasure) {
        this.availableKeys.forEach((key) => {
          this.notes[key].push(false);
        });
      }
    },
    drawNotes() {
      if (this.position % this.scaledMinMeasure === 0) {
        console.log('new tick!', this.currentTick += 1);
        this.availableKeys.forEach((key) => {
          const note = this.notes[key][this.currentTick];
          if (note) this.notesOnStage.push(note);
        });
      }
      this.notesOnStage.forEach((note) => {
        if (this.isKeyNeedTrigger(note)) {
          note.color = this.green;
          note.isOpen = true;
          this.noteOn(note);
        }
        this.sketch.fill(note.color);
        this.sketch.rect(this.getPositionX(note.number), note.y, this.keyWidth, note.h);

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
          const { midi, durationTicks, ticks } = note;
          const adjustedHeight = durationTicks * this.divisionRate;
          const adjustedStart = -ticks * this.divisionRate;
          this.notes[midi][ticks / this.minimumMeasure] = {
            number: midi,
            name: Midi(midi).toNote(),
            color: [255, 255, 255],
            velocity: 0,
            y: adjustedStart,
            h: -adjustedHeight,
            isOpen: false,
          };
        });
      });
      this.sketch.loop();
    },
    getPositionX(noteNumber) {
      return (noteNumber - this.lowestKey) * this.keyWidth;
    },
    keyDown() {
      this.sketch.noLoop();
    },
    keyUp() {
      this.sketch.loop();
    },
    isKeyNeedTrigger(note) {
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
      console.log('Note ON: ', note.name);
      this.$set(this.keys, note.number, true);
      this.piano.keyDown({ note: note.name });
    },
    noteOff(note) {
      console.log('Note OFF: ', note.name);
      this.$set(this.keys, note.number, false);
      this.piano.keyUp({ note: note.name });
    },
  },
};
</script>
