import * as PIXI from 'pixi.js';
import Note from '../models/Note';

export default function (view, data) {
  console.log(data, 'the data!');
  const app = new PIXI.Application({ view });
  app.resizeTo = view;
  console.log(app);

  const basicText = new PIXI.Text('Basic text in pixi', {
    fontFamily: 'Arial', fontSize: 24, fill: '#ffffff', align: 'center',
  });
  basicText.x = 50;
  basicText.y = app.screen.height - 30;
  app.stage.addChild(basicText);

  const notesContainer = new PIXI.Container();
  app.stage.addChild(notesContainer);

  function noteOn() {
    console.log('noteOn');
  }

  function noteOff(note) {
    console.log('noteOff');
    notesContainer.removeChild(note);
  }

  function gameLoop() {
    for (let i = notesContainer.children.length - 1; i >= 0; i -= 1) {
      const note = notesContainer.children[i];
      note.y += 5;
      note.update();
    }
  }

  data.tracks.forEach((track) => {
    for (let i = 0; i < 500; i += 1) {
      const note = track.notes[i];
      notesContainer.addChild(new Note(note, noteOn, noteOff));
    }
  });

  app.ticker.add((delta) => gameLoop(delta));
  window.app = app;
}
