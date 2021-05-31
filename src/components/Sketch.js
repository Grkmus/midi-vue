// /* eslint-disable */
import P5 from 'p5';
import _ from 'lodash';
import Note from '../models/Note';

const notes = [];
let notesGrouped;
const stage = [];
let position = 0;
let IS_PLAYING = false;

function bpm2px(tempo, deltaTime) {
  const deltaTimeAsSecond = (1000 / deltaTime);
  return (tempo * 4) / deltaTimeAsSecond;
}

export default function sketchIt(element, song) {
  const height = document.querySelector('#sheet').offsetHeight;
  const width = document.querySelector('#sheet').offsetWidth;
  const playButton = document.getElementById('play');
  const tempo = document.getElementById('tempo');
  playButton.onclick = () => { IS_PLAYING = !IS_PLAYING; };
  const s = (sketch) => {
    sketch.setup = () => {
      sketch.createCanvas(width, height);

      song.tracks.forEach((track, trackIndex) => {
        track.notes.forEach((note, noteIndex) => {
          notes.push(
            new Note(note, noteIndex, trackIndex, sketch, height),
          );
          notesGrouped = _.groupBy(notes, (note) => Math.floor(-note.y / 997)); // eslint-disable-line
        });
      });
      stage.push(...Object.values(notesGrouped).slice(0, 2));
      console.log(stage);
      console.log(notesGrouped);
    };

    sketch.draw = () => {
      sketch.background(0);
      if (IS_PLAYING) position += bpm2px(tempo.value, sketch.deltaTime);
      sketch.translate(0, position);
      stage.forEach((group, index) => {
        for (let i = group.length - 1; i >= 0; i -= 1) {
          const note = group[i];
          note.update(position);
          if (note.isPlayed) group.splice(i, 1);
          if (group.length === 0) {
            console.log('this group is finished', index);
            console.log('retrieving next group', index + 2);
            stage.push(notesGrouped[index + 2]);
          }
        }
      });
      sketch.text(stage.flat().length, 30, 30 - position);
      sketch.text(position, 30, 60 - position);
    };
  };

  new P5(s, element);
}
