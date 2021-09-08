import * as PIXI from 'pixi.js';
import _ from 'lodash';
import Note from '../models/Note';
import readFile from './ReadFile';

function parseData(data, screenHeight) {
  const notes = [];
  console.log(data.header.ppq);
  console.log(data.durationTicks);
  data.tracks.forEach((track) => {
    for (let i = 0; i < 100; i += 1) {
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
  app.renderer.plugins.interaction.on('pointerup', (e) => {
    console.log(e.data.global);
  });
  const noteContainers = await readFile().then((data) => parseData(data, app.screen.height));

  const tempo = document.getElementById('tempo');

  // function drawMeasures() {

  // }
  const STAGE = new PIXI.Container();
  const BAR = new PIXI.Container();
  app.stage.addChild(STAGE);
  app.stage.addChild(BAR);

  STAGE.addChild(...noteContainers.slice(0, 3));

  const stageFrame = new PIXI.Graphics();
  stageFrame.lineStyle(2, 0xFEEB77, 10);
  stageFrame.drawRect(0, app.screen.height * 0.1, app.screen.width, app.screen.height * 0.9);
  STAGE.addChild(stageFrame);

  const barFrame = new PIXI.Graphics();
  barFrame.lineStyle(2, 0xFEEB77, 10);
  barFrame.drawRect(0, 0, app.screen.width, app.screen.height * 0.1);
  BAR.addChild(barFrame);

  const barTick = new PIXI.Graphics();
  barTick.lineStyle(2, 0xFEEB77, 10);
  barTick.moveTo(0, 0);
  barTick.lineTo(0, app.screen.height * 0.1);
  BAR.addChild(barTick);

  const basicText = new PIXI.Text('Basic text in pixi', {
    fontFamily: 'Arial', fontSize: 24, fill: '#ffffff', align: 'center',
  });
  basicText.x = 50;
  basicText.y = app.screen.top + 30;
  STAGE.addChild(basicText);
  window.stage = STAGE;

  function drawScene() {
    stageFrame.y = -app.stage.y;
    barFrame.y = -app.stage.y;
    barTick.y = -app.stage.y;
  }

  const notesIterator = makeRangeIterator(3, noteContainers);

  function bpm2px(deltaTime) { return (tempo.value * 4) / (1000 / deltaTime); }

  // const tempo = document.getElementById('tempo');
  function gameLoop() {//eslint-disable-line
    app.stage.y += bpm2px(app.ticker.deltaMS);
    drawScene();
    barTick.x += 5;
    const hitPosition = -app.stage.y + app.screen.height;

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
