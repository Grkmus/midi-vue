<template>
  <div id="canvas"></div>
</template>

<script>
import P5 from 'p5';
// import _ from 'lodash';

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
      tempo: 2,
      notes: {},
      lowestKey: 36,
      highestKey: 96,
      noteScaleFactor: 2,
      isKeyPressed: false,
      isKeyBeingPressed: false,
      keyPressMargin: 10,
    };
  },
  mounted() {
    this.createNotes();
    this.render();
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
  },
  computed: {
    green() { return [52, 206, 77]; },
    red() { return [213, 7, 76]; },
    blue() { return [3, 132, 252]; },
    keyTriggerArea() {
      return this.height - this.keyPressMargin;
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
    parseNote(noteNumber, durationTick, currentTick) {
      const adjustedHeight = Math.round(durationTick / this.noteScaleFactor);
      const adjustedStart = Math.round(-currentTick / this.noteScaleFactor);
      this.$set(this.notes, noteNumber, [
        ...this.notes[noteNumber],
        {
          color: [255, 255, 255],
          velocity: 0,
          y: adjustedStart,
          h: -adjustedHeight,
          isReaden: true,
        },
      ]);
    },
    createNotes() {
      for (let i = this.lowestKey; i < this.highestKey; i += 1) {
        this.$set(this.notes, i, []);
      }
    },
    drawNotes(s) {
      for (let i = this.lowestKey; i < this.highestKey; i += 1) {
        const availableNotes = this.notes[i];
        for (let k = 0; k < availableNotes.length; k += 1) {
          const note = availableNotes[k];
          if (this.isKeyNeedTrigger(note) && this.isKeyPressed) note.color = this.green;
          else if (this.isKeyNeedTrigger(note) && !this.isKeyPressed) note.color = this.red;
          else if (this.isKeyNeedPressed(note) && this.isKeyBeingPressed) note.color = this.blue;

          if (note.y + note.h > this.height) availableNotes.splice(k, 1);
          s.textSize(32);
          s.text(note.y + note.h, 10, 60);
          s.text(this.height, 10, 120);
          s.text(note.h, 120, 120);
          s.fill(note.color[0], note.color[1], note.color[2]);
          s.rect(this.getPositionX(i), note.y += this.tempo, this.keyWidth, note.h, 10);
        }
      }
      if (this.position >= this.height) this.position = 0;
      this.position += this.tempo;
    },

    drawDivisions(s) {
      for (let i = 0; i < this.height; i += 80) {
        s.line(0, i, this.width, i);
      }
    },
    playMidi() {
      this.midiJson.tracks.forEach((track) => {
        track.notes.forEach((note) => {
          const { midi, durationTicks, ticks } = note;
          this.parseNote(midi, durationTicks, ticks);
        });
      });
    },
    getPositionX(noteNumber) {
      return (noteNumber - this.lowestKey) * this.keyWidth;
    },
    keyDown(e) {
      if (e.repeat) {
        this.isKeyBeingPressed = true;
        this.isKeyPressed = false;
      } else this.isKeyPressed = true;
    },
    keyUp() {
      this.isKeyPressed = false;
      this.isKeyBeingPressed = false;
    },
    isKeyNeedTrigger(note) {
      return (this.height - this.keyPressMargin) < note.y && note.y < this.height; //eslint-disable-line
    },
    isKeyNeedPressed(note) {
      return note.y > this.height && note.y + note.h < this.height;
    },
    render() {
      const sketch = (s) => {
        s.setup = () => { // eslint-disable-line
          s.createCanvas(this.width, this.height);
          s.stroke(255);
        };
        s.draw = () => { // eslint-disable-line
          s.background(33, 33, 33);
          s.stroke(255);
          this.drawDivisions(s);
          this.drawNotes(s);
        };
      };
      new P5(sketch, 'canvas'); //eslint-disable-line
    },
  },
};
</script>
