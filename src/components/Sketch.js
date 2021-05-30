/* eslint-disable */
import P5 from 'p5';
import Note from '../models/Note'

const notes = []
let notesGrouped;
const stage = [];
let SPEED = 5
let position = 0
// const RIGHT_HAND_DISABLED = document.getElementById('right-hand').checked
// const SHOW_NOTE_TEXT = true
// const PLAY_ALONG_MODE = document.getElementById('play-along').checked
// const WAIT_FOR_INPUT_MODE = document.getElementById('wait-input').checked
let IS_PLAYING = false

// playButton.onclick((e) => {
  //   console.log(e)
  // })
  
export default function sketch (element, song) {
  const height = document.querySelector('#sheet').offsetHeight;
  const width = document.querySelector('#sheet').offsetWidth;
  const playButton = document.getElementById('play')
  
  console.log(playButton)
  playButton.onclick = (e) => {
    console.log('lalal')
    if (IS_PLAYING) IS_PLAYING = false
    else IS_PLAYING = true
  }
  const s = ( sketch ) => {
    sketch.setup = () => {
      sketch.createCanvas(width, height);

      song.tracks.forEach((track, trackIndex) => {
        console.log(track);
        track.notes.forEach((note, noteIndex) => {
          notes.push(
            new Note(note, noteIndex, trackIndex, sketch, height),
          );
          notesGrouped = _.groupBy(notes, note => Math.floor(-note.y / 997))
        });
      });
      stage.push(...Object.values(notesGrouped).slice(0,2))
      console.log(stage)
      console.log(notesGrouped)
      window.notes = notes
      window.note = notes[0]
    };
    
    sketch.draw = () => {
      sketch.background(0);
      if (IS_PLAYING) position += SPEED
      // console.log(notes)
      sketch.translate(0, position)
      stage.forEach((group, index) => {
        for (let i = group.length - 1; i >= 0; i -= 1) {
          const note = group[i];
          note.update(position)
          if (note.isPlayed) group.splice(i, 1)
          if (group.length === 0) {
            console.log('this group is finished', index)
            console.log('retrieving next group', index + 2)
            stage.push(notesGrouped[index + 2])
          }
        }
      })
      sketch.text(stage.flat().length, 30, 30- position)
      sketch.text(position, 30, 60 - position)
      // sketch.text('TESTING', 30, 0)
      // console.log(notes[0])
    };


    // sketch.mousePressed = () => {
    //   sketch.noLoop()
    // }
  };
  
  let myp5 = new P5(s, element);
}