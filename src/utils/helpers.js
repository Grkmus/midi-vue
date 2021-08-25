import _ from 'lodash';

function getOffset(note) {
  const offsets = {
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
  return _.get(offsets, note.pitch, 0);
}

const colors = {
  get green() { return [52, 206, 77]; },
  get darkGreen() { return [50, 117, 61]; },
  get red() { return [245, 22, 22]; },
  get darkRed() { return [128, 38, 38]; },
  get blue() { return [3, 132, 252]; },
  get darkBlue() { return [59, 96, 133]; },
  get gray() { return [138, 138, 138]; },
};

const settings = {
  LEFT_HAND_ENABLED: document.getElementById('left-hand'),
  RIGHT_HAND_ENABLED: document.getElementById('right-hand'),
  PLAY_ALONG_MODE: document.getElementById('play-along'),
  WAIT_FOR_INPUT_MODE: document.getElementById('wait-input'),
};
export { getOffset, colors, settings };
