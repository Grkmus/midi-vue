<template>
  <div id="canvas"></div>
</template>

<script>
import P5 from 'p5';
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
      position: 0,
      lowestKey: 36,
      highestKey: 96,
      noteScaleFactor: 2,
    };
  },
  mounted() {
    this.createNotes();

    this.$parent.$on('playing', (tick) => {
      this.counter = tick;
    });

    const sketch = (s) => {
      s.setup = () => { // eslint-disable-line
        s.createCanvas(this.width, this.height);
        s.stroke(255);
      };
      s.draw = () => { // eslint-disable-line
        s.background(33, 33, 33);
        for (let i = 0; i < this.height; i += 80) {
          s.line(0, i, this.width, i);
        }
        s.line(10, this.position, 500, this.position);
        this.play(s);
      };
    };
    new P5(sketch, 'canvas'); //eslint-disable-line
  },
  methods: {
    parseNote(noteNumber, durationTick, currentTick) {
      const adjustedHeight = Math.round(durationTick / this.noteScaleFactor);
      const adjustedStart = Math.round(-currentTick / this.noteScaleFactor);
      this.$set(this.notes, noteNumber, [
        ...this.notes[noteNumber],
        {
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
    play(s) {
      for (let i = this.lowestKey; i < this.highestKey; i += 1) {
        const noteMark = this.notes[i];
        _.forEach(noteMark, (note) => {
          s.rect(this.getPositionX(i), note.y += this.tempo, this.keyWidth, note.h, 10);
        });
      }
      if (this.position >= this.height) this.position = 0;
      this.position += this.tempo;
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
  },
};
</script>
