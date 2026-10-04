import { byCss, byText } from './mouse.mjs';

// Every app-specific target the takes click, in one place. Fix here when the UI moves.
export const LEFT = [0, 640];
export const RIGHT = [640, 1e5];

export const UI = {
  importMenu: [`var ie=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Import/Export'); if(!ie) return null; var r=ie.getBoundingClientRect();
    return [...document.querySelectorAll('button')].find(b=>{var q=b.getBoundingClientRect(); return q.width>0&&Math.abs(q.top-r.top)<12&&q.left>=r.right-4&&q.left<r.right+48;});`, []],
  importConfirm: [`return [...document.querySelectorAll('button')].find(b=>/^Import \\d+ items$/.test(b.textContent.trim()));`, []],
  modalClose: [`var h=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()==='Import / Export'); if(!h) return null; var top=h.getBoundingClientRect().top;
    var c=[...document.querySelectorAll('button')].filter(b=>{var q=b.getBoundingClientRect(); return q.width>0&&!b.textContent.trim()&&Math.abs(q.top-top)<30;}); c.sort((a,b)=>b.getBoundingClientRect().left-a.getBoundingClientRect().left); return c[0];`, []],
  panelToggle: [byCss, ['button[title^="Themes & tools"]']],
  panelTab: (title) => [byCss, [`button[title="${title}"]`]],
  snippetRun: (name) => [`var rows=[...document.querySelectorAll('*')].filter(e=>e.textContent.includes(arguments[0])&&[...e.querySelectorAll('button[title]')].some(b=>/xecut/i.test(b.title)));
    rows.sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height);
    return rows[0]&&[...rows[0].querySelectorAll('button[title]')].find(b=>/xecut/i.test(b.title));`, [name]],
  terminal: [byCss, ['.xterm-screen']],
  sftpButton: [byCss, ['button[title="File Transfer (SFTP)"]']],
  homeDir: (side) => [byCss, ['button[title="Home directory"]', ...side]],
  hostPicker: (side) => [byCss, ['input[placeholder="Filter hosts..."]', ...side]],
  hostChip: (side) => [`var a=arguments[0], b=arguments[1]; return [...document.querySelectorAll('button')].find(e=>{var r=e.getBoundingClientRect(); return r.width>0&&r.top>70&&r.top<120&&r.left>=a&&r.left<b;});`, side],
  file: (name, side) => [byText, [name, ...side]],
};
