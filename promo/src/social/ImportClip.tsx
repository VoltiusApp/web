import React from 'react';
import { asTake, cutters, timeline, type Seg, type Take, type Timeline } from '../components/take';
import { accented, type CaptionCue } from '../components/Caption';
import { type CamKey, clipFrames, FootageClip, shots } from './FootageClip';
import termius from './takes/import-termius.json';
import mobaxterm from './takes/import-mobaxterm.json';
import putty from './takes/import-putty.json';
import securecrt from './takes/import-securecrt.json';
import zoc from './takes/import-zoc.json';
import csv from './takes/import-csv.json';

const { WIDE, focus } = shots('window');

const TAKES: Record<string, Take> = {
  termius: asTake(termius),
  mobaxterm: asTake(mobaxterm),
  putty: asTake(putty),
  securecrt: asTake(securecrt),
  zoc: asTake(zoc),
  csv: asTake(csv),
};

export const SOURCES = ['termius', 'mobaxterm', 'putty', 'securecrt', 'zoc', 'csv'] as const;
export type ImportSource = (typeof SOURCES)[number] | 'supercut';

// Only what each importer really brings across: MobaXterm folders and CSV columns arrive as tags.
const COPY: Record<(typeof SOURCES)[number], { name: string; hook: string; how: [string, string?]; result: [string, string?] }> = {
  termius: { name: 'Termius', hook: 'Leaving Termius?', how: ['One click.', 'No export file.'], result: ['Hosts, folders, keys', 'and snippets.'] },
  mobaxterm: { name: 'MobaXterm', hook: 'Coming from MobaXterm?', how: ['One click.'], result: ['Every session,', 'folders as tags.'] },
  putty: { name: 'PuTTY', hook: 'Still on PuTTY?', how: ['It reads your', 'saved sessions.'], result: ['Now with tabs,', 'splits and SFTP.'] },
  securecrt: { name: 'SecureCRT', hook: 'Your SecureCRT sessions?', how: ['Read from its config.'], result: ['Folders', 'included.'] },
  zoc: { name: 'ZOC Terminal', hook: 'On ZOC Terminal?', how: ['It finds your', 'host directory.'], result: ['Folders', 'included.'] },
  csv: { name: 'CSV', hook: 'Hosts in a spreadsheet?', how: ['Paste the CSV.'], result: ['Tags come from', 'a column.'] },
};

const MENU = focus(1080, 170, 1.2, { dx: 80 });
const DIALOG = focus(640, 440, 1.0);
const GRID = focus(640, 430, 0.92);

function single(source: (typeof SOURCES)[number]) {
  const takes = { a: TAKES[source] };
  const { seg, fit } = cutters(takes);
  const tl = timeline(takes, [
    seg('a', ['menu', -1.4], ['source', 0.3], 1.1),
    seg('a', ['source', 0.3], ['review', 0.2], source === 'csv' ? 1.4 : 1),
    seg('a', ['review', 0.2], ['import', 0.3], 1.6),
    fit('a', ['import', 0.3], ['imported', 0], 1.4),
    seg('a', ['imported', 0], ['grid', 0.1], 1.6),
    seg('a', ['grid', 0.1], ['end', -0.6], 1.4),
  ]);
  const at = (m: string, d = 0) => tl.at('a', m, d);
  const c = COPY[source];
  const cams: CamKey[] = [
    [0, WIDE],
    [at('menu', -0.2), MENU],
    [at('source', 0.6), MENU],
    [at('review', -0.1), DIALOG],
    [at('imported', 0.2), DIALOG],
    [at('grid', 0.3), GRID],
    [tl.frames, { ...GRID, s: GRID.s * 1.04 }],
  ];
  const cues: CaptionCue[] = [
    { from: 4, to: at('source', 0.1), text: c.hook },
    { from: at('source', 0.2), to: at('imported', 0), text: accented(...c.how) },
    { from: at('imported', 0.1), to: tl.frames, text: accented(...c.result) },
  ];
  return { tl, cams, cues };
}

// Six takes, two seconds each: the source's review list filling in, then its imported hosts.
function supercut() {
  const { seg, fit } = cutters(TAKES);
  const segs: Seg[] = SOURCES.flatMap((s) => [fit(s, ['review', -0.3], ['import', 0.3], 0.9), fit(s, ['imported', -0.2], ['grid', 0.6], 1.1)]);
  const tl = timeline(TAKES, segs);
  const starts = SOURCES.map((s) => tl.at(s, 'review', -0.3));
  const cues: CaptionCue[] = SOURCES.map((s, i) => ({ from: starts[i], to: starts[i + 1] ?? tl.at('csv', 'grid', -0.2), text: accented('From', `${COPY[s].name}.`) }));
  cues.push({ from: tl.at('csv', 'grid', -0.2), to: tl.frames, text: accented('Which client', 'is next?') });
  return { tl, cams: [[0, DIALOG], [tl.frames, { ...DIALOG, s: DIALOG.s * 1.06 }]] as CamKey[], cues };
}

const CLIPS = Object.fromEntries([...SOURCES.map((s) => [s, single(s)]), ['supercut', supercut()]]) as Record<ImportSource, { tl: Timeline; cams: CamKey[]; cues: CaptionCue[] }>;

export const importClipFrames = (source: ImportSource) => clipFrames(CLIPS[source].tl);

export const ImportClip: React.FC<{ source: ImportSource }> = ({ source }) => <FootageClip device="window" {...CLIPS[source]} />;
