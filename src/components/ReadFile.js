import { Midi } from '@tonejs/midi';

const reader = new FileReader();

export default function readFile() {
  return new Promise((resolve, reject) => {
    fetch(`${process.env.BASE_URL}MozartWolfgangAmadeus_AllaTurcaRondo.midi`).then((res) => res.blob()).then((res) => {
      reader.readAsArrayBuffer(res);
    });

    reader.addEventListener('onerror', () => {
      reject(new Error('Some error happened while reading the file'));
    });

    reader.addEventListener('loadend', (e) => {
      const file = new Midi(e.target.result);
      resolve(file);
    });
  });
}
