import * as PIXI from 'pixi.js';
import _ from 'lodash';
import Note from '../models/Note';
import settings from '../utils/settings';
// const BPM = 120;
// const BPM_SCALER = 1;
let NOTES_GROUPED;
const STAGE = [];
const theSettings = settings();
export default function (view, data) {
  console.log(data, 'the data!');
  const app = new PIXI.Application({ view });
  app.resizeTo = view;
  console.log(app);
  window.app = app;
  const basicText = new PIXI.Text('Basic text in pixi', {
    fontFamily: 'Arial', fontSize: 24, fill: '#ffffff', align: 'center',
  });
  basicText.x = 50;
  basicText.y = app.screen.height - 30;
  app.stage.addChild(basicText);

  const notesContainer = new PIXI.Container();
  data.tracks.forEach((track) => {
    for (let i = 0; i < 500; i += 1) {
      const note = track.notes[i];
      notesContainer.addChild(new Note(note));
      app.stage.addChild(notesContainer);
    }
  });
  app.stage.addChild(notesContainer);

  function gameLoop() {
    app.stage.y += 1;
    STAGE.forEach((group, index) => {
      for (let i = group.length - 1; i >= 0; i -= 1) {
        const note = group[i];
        note.update(app.stage.y);
        if (note.isPlayed) group.splice(i, 1);
        if (group.length === 0) {
          console.log('this two group is finished', index, index + 1);
          console.log('retrieving next group', index + 2);
          STAGE.push(NOTES_GROUPED[index + 2]);
          console.log(STAGE);
        }
      }
    });
  }
  NOTES_GROUPED = _.groupBy(notesContainer.children, (note) => Math.floor(-note.y / app.screen.height));
  console.log(NOTES_GROUPED);
  STAGE.push(...Object.values(NOTES_GROUPED).slice(0, 2));
  console.log(STAGE);
  window.STAGE = STAGE;
  window.NOTES_GROUPED = NOTES_GROUPED;

  app.ticker.add((delta) => gameLoop(delta));
  app.ticker.stop();
}
