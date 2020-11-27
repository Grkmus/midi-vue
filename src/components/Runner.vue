<template>
  <!-- <vue-p5
    @setup="setup"
    @draw="draw"
  >
  </vue-p5> -->
  <div id="canvas"></div>
</template>

<script>
import P5 from 'p5';

class Note {
  constructor(x, h) {
    this.y = -h;
    this.x = x;
    this.w = 50;
    this.h = h;
  }

  get noteNumber() {
    return this.noteNumber;
  }

  get measure() {
    return this.measure;
  }

  move(amount) {
    this.y += amount;
  }
}

export default {
  name: 'Runner',
  props: {
    width: null,
    height: null,
  },
  data() {
    return {
      p5: null,
      canvas: null,
      y: 0,
      tempo: 5,
      notes: [],
      position: 0,
    };
  },
  mounted() {
    const sketch = (s) => {
      console.log(s);
      const note1 = new Note(800, 50);
      const note2 = new Note(300, 100);
      const notes = [note1, note2];

      Note.prototype.show = function () {
        s.fill(255);
        s.rect(this.x, this.y, this.w, this.h);
      };

      s.setup = () => { // eslint-disable-line
        s.createCanvas(this.width, this.height);
        notes.forEach((note) => {
          note.show();
        });
      };
      // let h = window.innerHeight;
      s.draw = () => { // eslint-disable-line
        s.background(33, 33, 33);
        s.stroke(255);

        s.line(10, this.position, 500, this.position);

        notes.forEach((note) => {
          // console.log(note);
          note.show();
          note.move(this.tempo);
        });
        if (this.position >= this.height) this.position = 0;
        this.position += this.tempo;
      };

      s.mousePressed = () => { // eslint-disable-line
        console.log('mouse');
        notes.push(new Note(500, 100));
      };
    };

    this.canvas = new P5(sketch, 'canvas');
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
