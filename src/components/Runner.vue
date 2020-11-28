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
  },
  data() {
    return {
      canvas: null,
      tempo: 5,
      notes: [],
      position: 0,
      counter: 0,
      runningNotes: [],
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

        for (let i = 0; i < this.runningNotes.length; i += 1) {
          const note = this.runningNotes[i];
          if (note.isReaden && !note.isPlayed) {
            s.rect(note.noteNumber + i * 26, note.y += this.tempo, 26, note.h);
          }
          if (note.y > this.height) {
            this.$delete(this.runningNotes, i, note);
          }
        }

        if (this.position >= this.height) this.position = 0;
        this.position += this.tempo;
      };
    };
    this.canvas = new P5(sketch, 'canvas');
  },
  methods: {
    noteOn(noteNumber, velocity) {
      const noteIndex = noteNumber - 36;
      this.$set(this.notes, noteIndex, {
        velocity,
        y: 0,
        h: 0,
        isReaden: false,
        timeStamp: this.timeStamp,
      });
      console.log('midi event note ON', noteNumber, noteIndex);
    },
    noteOff(noteNumber) {
      const noteIndex = noteNumber - 36;
      const note = this.notes[noteIndex];
      const counter = (this.timeStamp - note.timeStamp) / 10;
      console.log('The time span: ', counter);
      this.runningNotes.push({
        noteNumber,
        velocity: 0,
        y: -counter,
        h: counter,
        isReaden: true,
      });

      console.log('midi event note OFF', noteNumber, noteIndex);
    },
    createNotes() {
      for (let i = 0; i < 61; i += 1) {
        this.notes.push({
          velocity: 0, y: 0, h: 0, isReaden: false,
        });
      }
    },
  },
};
</script>
