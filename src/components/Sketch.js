import * as PIXI from 'pixi.js';
import _ from 'lodash';
import Note from '../models/Note';
import readFile from './ReadFile';

function parseData(data, screenHeight) {
  const notes = [];
  data.tracks.forEach((track) => {
    for (let i = 0; i < 500; i += 1) {
      const note = track.notes[i];
      notes.push(new Note(note));
    }
  });

  return _.chain(notes)
    .groupBy((note) => Math.floor(-note.y / screenHeight))
    .map((group) => {
      const container = new PIXI.Container();
      container.addChild(...group);
      return container;
    })
    .value();
}

export default async function initApp(view) {
  const app = new PIXI.Application({ view });
  app.resizeTo = view;
  window.app = app;
  const basicText = new PIXI.Text('Basic text in pixi', {
    fontFamily: 'Arial', fontSize: 24, fill: '#ffffff', align: 'center',
  });
  basicText.x = 50;
  basicText.y = app.screen.top + 30;
  app.stage.addChild(basicText);

  const noteContainers = await readFile().then((data) => parseData(data, app.screen.height));
  console.log(noteContainers, 'okaoka');
  const STAGE = new PIXI.Container();
  STAGE.addChild(...noteContainers.slice(0, 3));
  app.stage.addChild(STAGE);
  let counter = 3;
  function gameLoop() {
    app.stage.y += 10;
    const hitPosition = -app.stage.y + app.screen.height;
    basicText.y = hitPosition - 30;
    basicText.text = STAGE.children.length;
    STAGE.children.forEach((group, index) => {
      for (let i = group.children.length - 1; i >= 0; i -= 1) {
        const note = group.children[i];
        note.update(hitPosition);
        if (note.isPlayed) group.removeChild(note);
        if (group.children.length === 0) {
          // STAGE.removeChild(group);
          console.log('this two group is finished', index, index + 1);
          console.log('retrieving next group', counter);
          STAGE.addChild(noteContainers[counter]);
          counter += 1;
          STAGE.removeChildAt(0);
          console.log(STAGE.children);
        }
      }
    });
  }

  app.ticker.add((delta) => gameLoop(delta));
}
