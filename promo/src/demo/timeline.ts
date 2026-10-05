import data from './data.json';
import { cutters, timeline, type Sample, type Take } from '../components/take';

export type Src = 'A' | 'B';

const take = (k: Src): Take => ({ src: `demo/${k}.mp4`, w: 1280, h: 800, marks: data[k].marks, cursor: data[k].cursor as Sample[] });
const TAKES = { A: take('A'), B: take('B') };
const { seg, fit } = cutters(TAKES);

export const TL = timeline(
  TAKES,
  [
    seg('A', ['import-open', -1.2], ['termius', 0.2], 1),
    seg('A', ['termius', 0.2], ['import', 0.1], 1.25),
    fit('A', ['import', 0.1], ['imported', 0.15], 2.5),
    seg('A', ['imported', 0.15], ['connect', 0], 1),
    fit('A', ['connect', 0], ['type', -0.1], 3.2),
    seg('A', ['type', -0.1], ['panel', -0.1], 1),
    seg('A', ['panel', -0.1], ['snippet', 0], 1),
    seg('A', ['docker', -0.1], ['themes', 0], 1),
    seg('A', ['themes', 0], ['palette', -0.1], 1.1),
    seg('A', ['palette', -0.1], ['split', -0.1], 1.15),
    seg('A', ['split', -0.1], ['end', -0.8], 1),
    seg('B', ['sftp', -0.25], ['dropped', 0.3], 1),
    fit('B', ['dropped', 0.3], ['landed', 0.1], 2),
    seg('B', ['landed', 0.1], ['end', -1.1], 1),
  ],
  [['A', 'B']],
);
