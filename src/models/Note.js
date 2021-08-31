import { Sprite, Graphics } from 'pixi.js';

const LOWEST_KEY = 24;
const keyWidth = 10.273809523809524;
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
export default class Note extends Sprite {
  constructor(note) {
    console.log('creating the note');
    const { midi, durationTicks, ticks } = note;
    super();
    this.midiNumber = midi;
    this.w = keyWidth;
    this.h = durationTicks;
    const thing = new Graphics();
    thing.lineStyle(1, 0xff0000, 1);
    thing.beginFill(0xffFF00, 0.5);
    thing.drawRoundedRect(0, 0, this.w, this.h, 10);
    const texture = app.renderer.generateTexture(thing); //eslint-disable-line
    this.texture = texture;
    this.x = (midi - LOWEST_KEY) * keyWidth;
    this.y = -ticks;
    this.isNoteOn = false;
    this.isPlayed = false;
    this.hitPosition = 0;
    this.anchor.set(1, 1);
  }

  update(hitPosition) {
    this.hitPosition = hitPosition;
    // console.log('catch the position from note!', position);
    if (this.noteOnCheck()) { this.noteOn(); }
    if (this.noteOffCheck()) { this.noteOff(); }
  }

  changeColor(color = 0x2F329F) {
    const thing = new Graphics();
    thing.lineStyle(1, 0xff0000, 1);
    thing.beginFill(color, 0.5);
    thing.drawRoundedRect(0, 0, this.w, this.h, 10);
    return app.renderer.generateTexture(thing); //eslint-disable-line
  }

  // eslint-disable-next-line
  noteOnCheck() { return this.hitPosition <= this.position.y  && !this.isNoteOn; }

  // eslint-disable-next-line
  noteOffCheck() { return this.hitPosition <= this.position.y - this.height; }

  noteOn() {
    // console.log('note on');
    this.isNoteOn = true;
    this.texture = this.changeColor();
  }

  noteOff() {
    // console.log('noteOff');
    this.isPlayed = true;
  }

  // handEnableCheck() {
  //   if (this.settings.LEFT_HAND_ENABLED.checked && this.hand === 'left') {
  //     this.color = WHITE_COLOR;
  //     this.isEnabled = true;
  //   } else if (this.settings.RIGHT_HAND_ENABLED.checked && this.hand === 'right') {
  //     this.color = WHITE_COLOR;
  //     this.isEnabled = true;
  //   } else {
  //     this.color = GRAY_COLOR;
  //     this.isEnabled = false;
  //   }
  // }

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
}
