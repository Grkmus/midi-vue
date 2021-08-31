import * as PIXI from 'pixi.js';
import _ from 'lodash';
import Note from '../models/Note';
import readFile from './ReadFile';

function parseData(data, screenHeight) {
  const notes = [];
  data.tracks.forEach((track) => {
    for (let i = 0; i < track.notes.length; i += 1) {
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

function* makeRangeIterator(start = 0, array) {
  for (let i = start; i < array.length; i += 1) {
    yield array[i];
  }
  return null;
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

  const STAGE = new PIXI.Container();
  STAGE.addChild(...noteContainers.slice(0, 3));
  app.stage.addChild(STAGE);
  console.log(noteContainers);

  const notesIterator = makeRangeIterator(3, noteContainers);
  function gameLoop() {
    app.stage.y += 5;
    const hitPosition = -app.stage.y + app.screen.height;
    basicText.y = hitPosition - 30;
    basicText.text = STAGE.children.length;

    STAGE.children.forEach((group) => {
      for (let i = group.children.length - 1; i >= 0; i -= 1) {
        const note = group.children[i];
        note.update(hitPosition);
        if (note.isPlayed) group.removeChild(note);
        if (group.children.length === 0) {
          STAGE.removeChild(group);
          const nextContainer = notesIterator.next().value;
          if (!nextContainer) return;
          STAGE.addChild(nextContainer);
        }
      }
    });
  }

  app.ticker.add((delta) => gameLoop(delta));
}
