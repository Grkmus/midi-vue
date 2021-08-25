export default function getSettings() {
  return {
    LEFT_HAND_ENABLED: document.getElementById('left-hand'),
    RIGHT_HAND_ENABLED: document.getElementById('right-hand'),
    PLAY_ALONG_MODE: document.getElementById('play-along'),
    WAIT_FOR_INPUT_MODE: document.getElementById('wait-input'),
  };
}
