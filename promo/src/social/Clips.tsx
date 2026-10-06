import React from 'react';
import { asTake, cutters, timeline, type At, type Seg, type Timeline } from '../components/take';
import { accented, type CaptionCue } from '../components/Caption';
import { type CamKey, clipFrames, drift, FootageClip, hold, shots } from './FootageClip';
import palette from './takes/palette.json';
import homelab from './takes/homelab.json';
import serial from './takes/serial.json';
import router from './takes/router.json';
import snippet from './takes/snippet.json';
import scrollback from './takes/scrollback.json';
import reconnect from './takes/reconnect.json';
import edit from './takes/edit.json';
import processes from './takes/processes.json';
import mcp from './takes/mcp.json';

const { WIDE, focus } = shots('window');
const TERM = focus(420, 260, 1.15, { dx: -40 });
// Tab bar and the first lines of a terminal, kept below the captions.
const TAB_TERM = focus(380, 110, 1.4, { dy: 230 });
const PANEL = focus(1000, 310, 1.2, { dx: 200, dy: 200 });

type Cut = { seg: (a: At, b: At, rate?: number) => Seg; fit: (a: At, b: At, seconds: number) => Seg };
type At2 = (mark: string, d?: number) => number;
type Built = { tl: Timeline; cams: CamKey[]; cues: CaptionCue[]; footer: string };

/** One take on the floating window: cuts from marks, then cameras and captions placed on the cut. */
function single(json: Parameters<typeof asTake>[0], cut: (c: Cut) => Seg[], place: (at: At2, end: number) => Omit<Built, 'tl'>): Built {
  const takes = { a: asTake(json) };
  const c = cutters(takes);
  const tl = timeline(takes, cut({ seg: (a, b, rate) => c.seg('a', a, b, rate), fit: (a, b, s) => c.fit('a', a, b, s) }));
  return { tl, ...place((m, d = 0) => tl.at('a', m, d), tl.frames) };
}

const cue = (from: number, to: number, text: string, accent?: string): CaptionCue => ({ from, to, text: accented(text, accent) });

const MCP_FOOTER = 'Voltius MCP server · local socket · Claude Code';
const mcpWork = ({ seg, fit }: Cut): Seg[] => [
  seg(['prompt', 0], ['enter', 0.6], 1.6),
  fit(['enter', 0.6], ['closed', 0], 7),
  seg(['closed', 0], ['answer', 0], 2.5),
  seg(['answer', 0], ['end', -0.3], 1.4),
];
const MCP_TERM = focus(620, 330, 0.98);

const CLIPS = {
  palette: single(palette, ({ seg }) => [
    seg(['k0', -1.4], ['open0', 0.9], 1.25),
    seg(['k1', -0.2], ['open1', 0.9], 1.25),
    seg(['k2', -0.2], ['end', -0.3], 1.25),
  ], (at, end) => {
    const PAL = focus(640, 260, 1.45, { dy: 190 });
    const OPEN = focus(560, 300, 1.1, { dy: 170 });
    return {
      cams: [
        ...hold(0, at('k0', -0.4), WIDE),
        ...[0, 1, 2].flatMap((i): CamKey[] => [
          ...hold(at(`k${i}`, 0.1), at(`open${i}`, -0.1), PAL),
          ...(i < 2 ? hold(at(`open${i}`, 0.4), at(`k${i + 1}`, -0.2), OPEN) : [[at(`open${i}`, 0.4), OPEN], [end, drift(OPEN)]] as CamKey[]),
        ]),
      ],
      cues: [cue(4, at('typed0'), 'Ctrl+K.'), cue(at('typed0'), at('open1'), 'A host name,', 'Enter.'), cue(at('open1'), end, 'Every host,', 'one keystroke.')],
      footer: 'command palette · Ctrl+K',
    };
  }),
  // The cut skips docker-01's Proxmox panel ("not detected") until the Docker icon is clicked.
  homelab: single(homelab, ({ seg }) => [seg(['shell', -1.4], ['docker', 1.6], 1.2), seg(['exec', -1.6], ['end', -0.4], 1.2)], (at, end) => ({
    cams: [
      ...hold(0, at('shell', 1.2), PANEL),
      ...hold(at('shell', 1.8), at('exec', -1.6), TAB_TERM),
      ...hold(at('exec', -1.1), at('exec', 0.9), PANEL),
      [at('exec', 1.5), TAB_TERM],
      [end, drift(TAB_TERM)],
    ],
    cues: [
      cue(4, at('shell'), 'Proxmox LXCs', 'in the side panel.'),
      cue(at('shell'), at('docker'), 'One click,', 'a shell inside.'),
      cue(at('docker'), at('ct'), 'Docker on another host?', 'Same panel.'),
      cue(at('ct'), end, 'Next to your', 'SSH hosts.'),
    ],
    footer: 'Proxmox LXC · Docker · over SSH',
  })),
  serial: single(serial, ({ seg }) => [seg(['serial', -1.2], ['console', 0.4], 1.5), seg(['console', 0.4], ['end', -0.3], 1.25)], (at, end) => {
    const BAR = focus(230, 788, 2.2, { dx: -250, dy: 300 });
    return {
      cams: [[0, WIDE], [at('port', -0.3), focus(640, 400, 1.15)], [at('console', 0.2), TERM], [at('lines', -0.2), BAR], [end, drift(BAR)]],
      cues: [cue(4, at('connect'), 'A router on a', 'serial cable.'), cue(at('connect'), at('lines'), '/dev/ttyUSB0,', '115200 baud.'), cue(at('lines'), end, 'DTR, RTS', 'and break.')],
      footer: 'serial console · OpenWrt 23.05',
    };
  }),
  router: single(router, ({ seg }) => [seg(['open', -1.2], ['end', -0.3], 1.2)], (at, end) => ({
    cams: [[0, WIDE], [at('shell'), TERM], [end, drift(TERM)]],
    cues: [cue(4, at('shell'), 'OpenWrt.', 'BusyBox, no base64.'), cue(at('shell'), at('nob64'), 'Voltius opens a shell anyway.'), cue(at('nob64'), end, 'Routers are', 'hosts too.')],
    footer: 'OpenWrt · BusyBox ash · over SSH',
  })),
  snippet: single(snippet, ({ seg }) => [seg(['run', -1.4], ['end', -0.2], 1.1)], (at, end) => ({
    cams: [[0, PANEL], [at('ask', -0.2), focus(640, 380, 1.3)], [at('output', -0.5), TERM], [end, drift(TERM)]],
    cues: [cue(4, at('ask'), 'A saved snippet,', 'one click.'), cue(at('ask'), at('output'), 'Variables ask', 'before it runs.'), cue(at('output'), end, 'On any host.')],
    footer: 'snippets · {{variables}}',
  })),
  scrollback: single(scrollback, ({ seg }) => [
    seg(['type', -0.6], ['scroll', 0], 1.8),
    seg(['scroll', 0], ['select', 1], 1.25),
    seg(['select', 1], ['find', 1], 1),
    seg(['find', 1], ['end', -0.3], 1.25),
  ], (at, end) => {
    const ALL = focus(640, 400, 0.95);
    const SEL = focus(300, 330, 1.6, { dx: -337, dy: 160 });
    const FIND = focus(640, 205, 1.28, { dy: 190 });
    return {
      cams: [
        ...hold(0, at('scroll', -0.4), TAB_TERM),
        ...hold(at('scroll', 0.3), at('select', 0.6), ALL),
        ...hold(at('select', 1.2), at('find', 0.2), SEL),
        ...hold(at('find', 0.7), at('next', -0.2), FIND),
        [at('next', 0.4), ALL],
        [end, drift(ALL)],
      ],
      cues: [cue(4, at('scroll'), 'A tmux session', 'on web-01.'), cue(at('scroll'), at('select', 1.2), 'Native scroll.'), cue(at('select', 1.2), at('find'), 'Drag to select.'), cue(at('find'), end, 'Ctrl+F', 'through history.')],
      footer: 'persistent sessions · tmux 3.2+',
    };
  }),
  reconnect: single(reconnect, ({ seg, fit }) => [seg(['build', -0.6], ['cut', 0.6], 1.4), fit(['cut', 0.6], ['back', 0], 2.4), seg(['back', 0], ['end', -0.3], 1.2)], (at, end) => ({
    cams: [[0, TERM], [at('cut', 0.6), WIDE], [at('live'), TERM], [end, drift(TERM)]],
    cues: [cue(4, at('cut'), 'A build is running.'), cue(at('cut', 0.6), at('back'), 'The link', 'drops.'), cue(at('back'), at('live', 1), 'Voltius reconnects.'), cue(at('live', 1), end, 'Same session.', 'Still building.')],
    footer: 'persistent sessions · tmux or screen on the host',
  })),
  edit: single(edit, ({ seg }) => [seg(['open', -1], ['save', 1.2], 1.5), seg(['check', -0.2], ['end', -0.3], 1.3)], (at, end) => ({
    cams: [[0, focus(950, 250, 1.15, { dx: -80 })], [at('editor', -0.2), focus(400, 260, 1.3)], [at('check'), TERM], [end, drift(TERM)]],
    cues: [cue(4, at('editor'), 'A config file', 'on web-01.'), cue(at('editor'), at('save'), 'Edit it in Voltius.'), cue(at('save'), at('check'), 'Ctrl+S.'), cue(at('check'), end, "It's on", 'the server.')],
    footer: 'built-in editor · over SFTP',
  })),
  processes: single(processes, ({ seg }) => [seg(['panel', -1.2], ['end', -0.3], 1)], (at, end) => {
    const LIST = focus(1130, 200, 1.7, { dx: 150 });
    return {
      cams: [[0, TERM], [at('panel', 0.8), LIST], [end, drift(LIST)]],
      cues: [cue(4, at('kill'), 'Something is', 'eating a core.'), cue(at('kill'), at('confirm', 0.5), 'Find it,', 'kill it.'), cue(at('confirm', 0.5), end, 'No ps aux | grep.')],
      footer: 'process manager · any connected host',
    };
  }),
  mcp: single(mcp, (c) => [c.seg(['toggle', -1.5], ['claude', 0], 1.2), c.seg(['claude', 0], ['prompt', 0], 2.5), ...mcpWork(c)], (at, end) => ({
    cams: [[0, focus(810, 240, 1.5)], [at('claude'), MCP_TERM], [end, drift(MCP_TERM)]],
    cues: [
      cue(4, at('claude'), 'MCP server:', 'off by default.'),
      cue(at('claude'), at('enter'), 'Claude Code,', 'in a Voltius tab.'),
      cue(at('enter', 0.6), at('closed'), 'It opens real tabs', 'on every prod host.'),
      cue(at('closed'), end, 'One prompt.', 'Real tabs.'),
    ],
    footer: MCP_FOOTER,
  })),
  'mcp-prompt': single(mcp, mcpWork, (at, end) => ({
    cams: [[0, MCP_TERM], [end, drift(MCP_TERM)]],
    cues: [cue(4, at('closed'), 'It checks every', 'prod host.'), cue(at('closed'), end, 'One prompt.', 'Real tabs.')],
    footer: MCP_FOOTER,
  })),
};

export type ClipId = keyof typeof CLIPS;
export const CLIP_IDS = Object.keys(CLIPS) as ClipId[];
export const clipFramesOf = (id: ClipId) => clipFrames(CLIPS[id].tl);

export const Clip: React.FC<{ id: ClipId }> = ({ id }) => <FootageClip device="window" {...CLIPS[id]} />;
