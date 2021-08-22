// /* eslint-disable */
import { Sprite, Graphics } from 'pixi.js';

const LOWEST_KEY = 24;
const keyWidth = 30.273809523809522;
// const STANDART_QUARTER_NOTE_HEIGHT = 1;
// const OFFSETS = {
//   'C#': 2,
//   'D#': 4,
//   'F#': 6,
//   'G#': 4,
//   G: 5,
//   A: 3,
//   E: 3,
//   F: 5,
//   D: 5,
// };
const GRAY_COLOR = [138, 138, 138];
const WHITE_COLOR = [255];
export default class Note extends Sprite {
  constructor(note, noteOnCb, noteOffCb) {
    console.log('creating the note');
    const { midi, durationTicks, ticks } = note;
    super();
    this.midiNumber = midi;
    this.x = (midi - LOWEST_KEY) * keyWidth;
    this.y = -ticks;
    this.w = keyWidth;
    this.h = durationTicks;
    const thing = new Graphics();
    thing.lineStyle(1, 0xff0000, 1);
    thing.beginFill(0xffFF00, 0.5);
    thing.drawRoundedRect(0, 0, this.w, this.h, 10);
    const texture = app.renderer.generateTexture(thing); //eslint-disable-line
    this.texture = texture;
    this.noteOnCb = noteOnCb;
    this.noteOffCb = noteOffCb;
    this.isNoteOn = false;
  }

  update() {
    if (this.y + this.height >= app.screen.height && !this.isNoteOn) {//eslint-disable-line
      this.isNoteOn = true;
      this.noteOnCb(this);
      this.changeColor();
    }
    if (this.y > app.screen.height) {//eslint-disable-line
      this.noteOffCb(this);
    }
  }

  changeColor() {
    const thing = new Graphics();
    thing.lineStyle(1, 0xff0000, 1);
    thing.beginFill(0x2F329F, 0.5);
    thing.drawRoundedRect(0, 0, this.w, this.h, 10);
    const texture = app.renderer.generateTexture(thing); //eslint-disable-line
    this.texture = texture;
  }

  handEnableCheck() {
    if (this.settings.LEFT_HAND_ENABLED.checked && this.hand === 'left') {
      this.color = WHITE_COLOR;
      this.isEnabled = true;
    } else if (this.settings.RIGHT_HAND_ENABLED.checked && this.hand === 'right') {
      this.color = WHITE_COLOR;
      this.isEnabled = true;
    } else {
      this.color = GRAY_COLOR;
      this.isEnabled = false;
    }
  }

  noteStartCheck() {
    return this.position >= -this.y + this.height;
  }

  noteStopCheck() {
    return this.position >= -this.y - this.h + this.height;
  }

  draw() {
    this.sketch.fill(this.color);
    this.sketch.rect(this.x, this.y, 30, this.h, 10);
  }

  pickMode() {
    if (this.settings.WAIT_FOR_INPUT_MODE.checked && this.isEnabled) {
      console.log('wait for input mode');
      // note.isOpen = true;
      // this.keysToBePressed.add(note.number);
      // console.log(this.keysToBePressed);
      // this.pressKeyComponent(note.octave, note.name);
      // this.$emit('pause');
    }
    if (this.settings.PLAY_ALONG_MODE.checked) {
      console.log('playalong mode');
      // note.isOpen = true;
      // this.$set(this.notes, i, note);
      // this.noteOn(note, i);
      // console.log('note started', note, i);
    }
  }

  playNote() {
    this.isOpen = true;
    if (this.isEnabled) this.noteOnCallBack(this.octave, this.pitch, this.midiNumber);
  }

  stopNote() {
    this.isOpen = false;
    if (this.isEnabled) this.noteOffCallBack(this.octave, this.pitch, this.midiNumber);
    this.isPlayed = true;
  }
}
