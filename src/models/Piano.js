import { Piano } from '@tonejs/piano';

const piano = new Piano({ velocities: 2 });
piano.toDestination();
piano.output.gain.value = 0.1;
piano.load().then(() => {
  // console.log('loaded!');
});

export default piano;
