/* eslint-disable */
import piano from './Piano';

// console.log('SETTINGS prom: ', settings);
// settings.then((res) => {
//   console.log('SEts', res)
// });
// let SPEED
// let LEFT_HAND_DISABLED
// let RIGHT_HAND_DISABLED
// let SHOW_NOTE_TEXT
// let PLAY_ALONG_MODE
// let WAIT_FOR_INPUT_MODE
// let IS_PLAYING

// window.addEventListener('load', () => {
//   SPEED = 5
//   LEFT_HAND_DISABLED = document.getElementById('left-hand').checked
//   RIGHT_HAND_DISABLED = document.getElementById('right-hand').checked
//   SHOW_NOTE_TEXT = true
//   PLAY_ALONG_MODE = document.getElementById('play-along').checked
//   WAIT_FOR_INPUT_MODE = document.getElementById('wait-input').checked
//   IS_PLAYING = true
// })
const LOWEST_KEY = 24;
const KEYWIDTH = 22;
const STANDART_QUARTER_NOTE_HEIGHT = 1;
const OFFSETS = {
  'C#': 2,
  'D#': 4,
  'F#': 6,
  'G#': 4,
  G: 5,
  A: 3,
  E: 3,
  F: 5,
  D: 5,
};
const GRAY_COLOR = [138, 138, 138]
const WHITE_COLOR = [255]
console.log(piano)
export default class Note {
  #SPEED = 5
  #LEFT_HAND_ENABLED = document.getElementById('left-hand')
  #RIGHT_HAND_ENABLED = document.getElementById('right-hand')
  #SHOW_NOTE_TEXT = document.getElementById('show-text')
  #PLAY_ALONG_MODE = document.getElementById('play-along')
  #WAIT_FOR_INPUT_MODE = document.getElementById('wait-input')
  #IS_PLAYING = true
  constructor(note, noteIndex, trackIndex, sketch, sheetHeight, cb) {
    const {
      midi, durationTicks, ticks, pitch,
    } = note;
    this.midiNumber = midi
    this.x = (midi - LOWEST_KEY) * KEYWIDTH;
    this.y = -ticks;
    this.noteIndex = noteIndex
    this.noteIsPlayedCb = cb
    // this.w = w;
    this.h = -durationTicks;
    this.sketch = sketch;
    this.color = GRAY_COLOR;
    this.height = sheetHeight
    this.hand = trackIndex === 1 ? 'left' : 'right';;
  }

  draw() {
    // this.sketch.rect(this.x, this.y, this.w, this.h);
    this.sketch.fill(this.color);
    this.sketch.rect(this.x, this.y, 30, this.h, 10);
  }

  update(position) {
    this.handColorCheck();
    if (position >= -this.y + this.height) this.noteOn()
    if (position >= -this.y - this.h + this.height) this.stopTheNote()
    this.draw();
    // if (this.RIGHT_HAND_Enabled) this.rightHandEnabled();
  }

  handColorCheck() {
    const check = () => {
      if (this.#LEFT_HAND_ENABLED.checked && this.hand === 'left') return WHITE_COLOR;
      else if (this.#RIGHT_HAND_ENABLED.checked && this.hand === 'right') return WHITE_COLOR;
      return GRAY_COLOR
    }
    this.color = check()
  }

  playTheNote() {
    this.noteOn()
    // console.log('this note is played')
  }
  stopTheNote() {
    this.noteOff()
    // console.log('this note is played')
    this.isPlayed = true
  }
  
  
  noteOn() {
    // play the note
    piano.keyDown({ midi: this.midiNumber });
    this.isOpen = true;
  }
  
  noteOff() {
    // stop the note
    piano.keyUp({ midi: this.midiNumber });
    this.isOpen = false;
  }
}
