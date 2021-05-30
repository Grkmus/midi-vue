export default new Promise((resolve) => {
  window.addEventListener('load', () => {
    resolve(
      {
        SPEED: 5,
        LEFT_HAND_DISABLED: document.getElementById('left-hand').checked,
        RIGHT_HAND_DISABLED: document.getElementById('right-hand').checked,
        SHOW_NOTE_TEXT: true,
        PLAY_ALONG_MODE: document.getElementById('play-along').checked,
        WAIT_FOR_INPUT_MODE: document.getElementById('wait-input').checked,
        IS_PLAYING: true,
      },
    );
  });
});
