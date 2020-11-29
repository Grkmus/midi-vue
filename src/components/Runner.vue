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
      canvas: null,
      tempo: 3,
      notes: {},
      position: 0,
      counter: 0,
      runningNotes: {},
      lowestKey: 36,
      highestKey: 96,
      noteScaleFactor: 12,
    };
  },
  computed: {
    timeStamp() {
      return _.cloneDeep(this.counter);
    },
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
    this.canvas = new P5(sketch, 'canvas');
  },
  methods: {
    noteOn(noteNumber, velocity, deltaTime) {
      this.$set(this.notes, noteNumber, {
        ...this.notes[noteNumber],
        velocity,
        y: 0,
        h: 0,
        isReaden: false,
        deltaTime,
      });
    },
    noteOff(noteNumber, deltaTime, timeStamp) {
      // const counter = (deltaTime - this.notes[noteNumber].deltaTime) / 12;
      console.log(noteNumber, deltaTime, timeStamp);
      this.$set(this.notes[noteNumber], 'runningNotes', [
        ...this.notes[noteNumber].runningNotes,
        {
          velocity: 0,
          y: -timeStamp / this.noteScaleFactor,
          h: deltaTime / this.noteScaleFactor,
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
          // if (note.y > this.height) this.$delete(this.runningNotes, i, note);
        });
      }
      if (this.position >= this.height) this.position = 0;
      this.position += this.tempo;
    },
    playMidi() {
      this.midiJson.track[1].event.forEach((event) => {
        const { data, deltaTime, timeStamp } = event;
        if (data && Number.isInteger(data[0])) {
          const noteNumber = data[0];
          // const velocity = data[1];
          // console.log(noteNumber, velocity, deltaTime, timeStamp);
          this.noteOff(noteNumber, deltaTime, timeStamp);
        }
        // if (velocity === 0) this.noteOff(noteNumber, deltaTime, timeStamp);
        // this.noteOff(noteNumber, deltaTime, timeStamp);
        // if (velocity > 0 && noteNumber) this.noteOn(noteNumber, velocity, deltaTime);
        // else if (velocity === 0) this.noteOff(noteNumber, deltaTime, timeStamp);
      });
      // this.$parent.$on('midievent', ({ data, deltaTime }) => {
      //   console.log(noteNumber, velocity);
      //   s.loop();
      // });
    },
  },
};
</script>
