// pane.mjs N TEXT — types into the Nth terminal pane (0-based).
import * as m from './wd.mjs';
await m.ensureSession();
await m.js('var t=document.querySelectorAll(".xterm-helper-textarea")[arguments[0]]; t && t.focus(); return !!t', [+process.argv[2]]);
await m.typeHuman(process.argv[3].replace(/\\n/g, '\n'), { min: 20, max: 40 });
