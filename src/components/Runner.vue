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
  },
  data() {
    return {
      canvas: null,
      tempo: 4.1,
      notes: {},
      position: 0,
      counter: 0,
      runningNotes: {},
      lowestKey: 36,
      highestKey: 96,
      noteScaleFactor: 2,
    };
  },
  computed: {
    timeStamp() {
      return _.cloneDeep(this.counter);
    },
  },
  mounted() {
    this.createNotes();

    this.$parent.$on('midievent', ({ noteNumber, velocity }) => {
      if (velocity > 0 && noteNumber) this.noteOn(noteNumber, velocity);
      else if (velocity === 0) this.noteOff(noteNumber, velocity);
    });

    this.$parent.$on('playing', (tick) => {
      this.counter = tick;
    });

    const sketch = (s) => {
      s.setup = () => { // eslint-disable-line
        s.createCanvas(this.width, this.height);
      };
      s.draw = () => { // eslint-disable-line
        s.background(33, 33, 33);
        s.line(10, this.position, 500, this.position);
        this.play(s);
      };
    };
    this.canvas = new P5(sketch, 'canvas');
  },
  methods: {
    noteOn(noteNumber, velocity) {
      this.$set(this.notes, noteNumber, {
        ...this.notes[noteNumber],
        velocity,
        y: 0,
        h: 0,
        isReaden: false,
        timeStamp: this.timeStamp,
      });
    },
    noteOff(noteNumber) {
      const counter = (this.timeStamp - this.notes[noteNumber].timeStamp) / this.noteScaleFactor;
      this.$set(this.notes[noteNumber], 'runningNotes', [
        ...this.notes[noteNumber].runningNotes,
        {
          velocity: 0,
          y: -counter,
          h: counter,
          isReaden: true,
        },
      ]);
    },
    createNotes() {
      for (let i = this.lowestKey; i < this.highestKey; i += 1) {
        this.$set(this.notes, i, {
          velocity: 0, y: 0, h: 0, isReaden: false, runningNotes: [],
        });
      }
    },
    play(s) {
      for (let i = this.lowestKey; i < this.highestKey; i += 1) {
        const noteMark = this.notes[i];
        _.forEach(noteMark.runningNotes, (note) => {
          s.rect((i - this.lowestKey) * this.keyWidth, note.y += this.tempo, this.keyWidth, note.h); // eslint-disable-line
          if (note.y > this.height) this.$delete(this.runningNotes, i, note);
        });
      }
      if (this.position >= this.height) this.position = 0;
      this.position += this.tempo;
    },
  },
};
</script>
