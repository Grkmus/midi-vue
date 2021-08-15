// /* eslint-disable */

const LOWEST_KEY = 24;
const KEYWIDTH = 22;
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

export default class Note {
  constructor(note, noeIndex, trackIndex, sheetHeight, noteOnCallBack, noteOffCallBack) {
    const {
      midi, durationTicks, ticks, pitch, octave,
    } = note;
    this.midiNumber = midi;
    this.x = (midi - LOWEST_KEY) * KEYWIDTH;
    this.y = -ticks;
    this.octave = octave;
    this.pitch = pitch;
    this.noteOnCallBack = noteOnCallBack;
    this.noteOffCallBack = noteOffCallBack;
    // this.w = w;
    this.h = -durationTicks;
    this.color = WHITE_COLOR;
    this.height = sheetHeight;
    this.hand = trackIndex === 1 ? 'left' : 'right';
    this.position = 0;
    this.isEnabled = true;
  }

  update(position) {
    this.position = position;
    this.handEnableCheck();
    if (this.noteStartCheck()) this.playNote();
    if (this.noteStopCheck()) this.stopNote();
    // this.pickMode()
    this.draw();
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
