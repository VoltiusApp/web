import * as m from './wd.mjs';
await m.ensureSession();
await m.js('var t=document.querySelector(".xterm-helper-textarea"); t && t.focus(); return !!t');
await m.typeHuman(process.argv[2].replace(/\\n/g, '\n'));
