#!/usr/bin/env node
// Posts the next due tweet from queue.json to X, then opens an issue to post it on LinkedIn by hand.
// Modes: check | dry-run | post | verify.
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = import.meta.dirname;
const MODE = process.argv[2] ?? 'dry-run';
const QUEUE = JSON.parse(readFileSync(join(DIR, 'queue.json'), 'utf8'));
const LEAD_DAYS = 5;
const CHUNK = 4 * 1024 * 1024;
const TYPES = { mp4: 'video/mp4', mov: 'video/quicktime', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
const LABEL = { approval: 'social-approval', approved: 'approved', log: 'social-log', linkedin: 'social-linkedin' };
const LINKEDIN_COMPOSER = 'https://www.linkedin.com/company/146696476/admin/page-posts/published/?share=true';
const LINKEDIN_MAX = 3000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = process.env.SOCIAL_TODAY ?? new Date().toISOString().slice(0, 10);
const daysUntil = (date) => Math.round((Date.parse(date) - Date.parse(today)) / 86400000);

// X counts most non-Latin code points (arrows, emoji, CJK) as 2 and every URL as 23.
const xLength = (text) =>
  [...text.replace(/https?:\/\/\S+/g, 'x'.repeat(23))].reduce((n, ch) => {
    const c = ch.codePointAt(0);
    const light = c <= 4351 || (c >= 8192 && c <= 8205) || (c >= 8208 && c <= 8223) || (c >= 8242 && c <= 8247);
    return n + (light ? 1 : 2);
  }, 0);

const mediaFile = (id) => {
  for (const ext of Object.keys(TYPES)) {
    const path = join(DIR, 'media', `${id}.${ext}`);
    if (existsSync(path)) return { path, rel: `social/media/${id}.${ext}`, type: TYPES[ext], sha: createHash('sha256').update(readFileSync(path)).digest('hex') };
  }
  return null;
};

function check() {
  const errors = [];
  const ids = new Set();
  for (const e of QUEUE) {
    if (ids.has(e.id)) errors.push(`#${e.id}: duplicate id`);
    ids.add(e.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date) || Number.isNaN(Date.parse(e.date))) errors.push(`#${e.id}: bad date ${e.date}`);
    if (xLength(e.text) > 280) errors.push(`#${e.id}: ${xLength(e.text)} > 280 characters`);
    if (e.media && !['video', 'image'].includes(e.media)) errors.push(`#${e.id}: media must be video or image`);
    if (e.linkedin !== undefined && e.linkedin !== false && typeof e.linkedin !== 'string') errors.push(`#${e.id}: linkedin must be text or false`);
    if (typeof e.linkedin === 'string' && e.linkedin.length > LINKEDIN_MAX) errors.push(`#${e.id}: linkedin text ${e.linkedin.length} > ${LINKEDIN_MAX} characters`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`queue ok: ${QUEUE.length} tweets, longest ${Math.max(...QUEUE.map((e) => xLength(e.text)))} characters`);
}

const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

function oauth(method, url) {
  const env = (k) => process.env[k] ?? (() => { throw new Error(`${k} is not set`); })();
  const params = {
    oauth_consumer_key: env('X_API_KEY'),
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: env('X_ACCESS_TOKEN'),
    oauth_version: '1.0',
  };
  const u = new URL(url);
  const pairs = [...Object.entries(params), ...u.searchParams.entries()].map(([k, v]) => `${enc(k)}=${enc(v)}`).sort();
  const base = [method, enc(u.origin + u.pathname), enc(pairs.join('&'))].join('&');
  const signature = createHmac('sha1', `${enc(env('X_API_SECRET'))}&${enc(env('X_ACCESS_SECRET'))}`).update(base).digest('base64');
  return `OAuth ${Object.entries({ ...params, oauth_signature: signature }).map(([k, v]) => `${enc(k)}="${enc(v)}"`).join(', ')}`;
}

async function request(base, auth, method, path, body) {
  const url = base + path;
  const headers = { authorization: auth(method, url), 'user-agent': 'voltius-social' };
  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(url, { method, headers, body: payload });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

const x = (method, path, body) => request('https://api.x.com', oauth, method, path, body);
const REPO = process.env.GITHUB_REPOSITORY ?? 'VoltiusApp/web';
const gh = (method, path, body) => request(`https://api.github.com/repos/${REPO}`, () => `Bearer ${process.env.GITHUB_TOKEN}`, method, path, body);

async function upload(file) {
  const bytes = readFileSync(file.path);
  const category = file.type.startsWith('video/') ? 'tweet_video' : file.type === 'image/gif' ? 'tweet_gif' : 'tweet_image';
  const { data } = await x('POST', '/2/media/upload/initialize', { media_type: file.type, total_bytes: bytes.length, media_category: category });
  for (let i = 0; i * CHUNK < bytes.length; i++) {
    const form = new FormData();
    form.append('segment_index', String(i));
    form.append('media', new Blob([bytes.subarray(i * CHUNK, (i + 1) * CHUNK)]));
    await x('POST', `/2/media/upload/${data.id}/append`, form);
  }
  let info = (await x('POST', `/2/media/upload/${data.id}/finalize`)).data?.processing_info;
  while (info && ['pending', 'in_progress'].includes(info.state)) {
    await sleep((info.check_after_secs ?? 5) * 1000);
    info = (await x('GET', `/2/media/upload?command=STATUS&media_id=${data.id}`)).data?.processing_info;
  }
  if (info?.state === 'failed') throw new Error(`X rejected ${file.rel}: ${JSON.stringify(info.error)}`);
  return data.id;
}

async function ensureLabels() {
  const have = new Set((await gh('GET', '/labels?per_page=100')).map((l) => l.name));
  const want = { [LABEL.approval]: 'a855f7', [LABEL.approved]: '22c55e', [LABEL.log]: '64748b', [LABEL.linkedin]: '0a66c2' };
  for (const [name, color] of Object.entries(want)) if (!have.has(name)) await gh('POST', '/labels', { name, color });
}

const STATE_RE = /<!-- state:(.*?) -->/s;
const MARK_RE = /<!-- social:(\d+) sha:(\w+) -->/;
const LINKEDIN_RE = /<!-- linkedin:(\d+) -->/;

async function loadGitHub() {
  const issues = async (label) => {
    const all = [];
    for (let page = 1; ; page++) {
      const batch = await gh('GET', `/issues?labels=${label}&state=all&per_page=100&page=${page}`);
      all.push(...batch);
      if (batch.length < 100) return all;
    }
  };
  const log = (await issues(LABEL.log)).find((i) => i.state === 'open');
  const state = log ? JSON.parse(log.body.match(STATE_RE)?.[1] ?? '{}') : {};
  const approvals = new Map();
  for (const issue of await issues(LABEL.approval)) {
    const m = issue.body?.match(MARK_RE);
    if (m) approvals.set(Number(m[1]), { issue, sha: m[2], approved: issue.labels.some((l) => l.name === LABEL.approved) });
  }
  const linkedin = new Map();
  for (const issue of await issues(LABEL.linkedin)) {
    const m = issue.body?.match(LINKEDIN_RE);
    if (m) linkedin.set(Number(m[1]), issue);
  }
  return { log, state: { posted: {}, skipped: {}, needs: [], ...state }, approvals, linkedin };
}

const linkedinBody = (e, file) => `Posted on X: https://x.com/i/status/${e.tweet}

1. Open the [Voltius page composer](${LINKEDIN_COMPOSER}).
2. Paste the text below${file ? ` and attach [${file.rel}](https://github.com/${REPO}/raw/main/${file.rel})` : ''}.
3. Post, then close this issue.

\`\`\`text
${e.linkedin ?? e.text}
\`\`\`

To skip it on LinkedIn, close it as not planned.

<!-- linkedin:${e.id} -->`;

const approvalBody = (e, file) => `**${e.date}** · ${e.visual}

> ${e.text.replace(/\n/g, '\n> ')}

Media: [${file.rel}](https://github.com/${REPO}/blob/main/${file.rel})

Add the \`${LABEL.approved}\` label to let it post. Close the issue without the label to drop the tweet. Replacing the file asks for approval again.

<!-- social:${e.id} sha:${file.sha} -->`;

function statusOf(e, file, approval, state) {
  if (state.posted[e.id]) return 'posted';
  if (state.skipped[e.id]) return 'dropped';
  if (e.hold) return `on hold: ${e.hold}`;
  if (e.media && !file) return `needs ${e.media} (${e.visual})`;
  if (file?.type.startsWith('video/')) {
    if (!approval) return 'awaiting approval issue';
    if (approval.sha !== file.sha) return 'video changed, needs approval';
    if (approval.issue.state === 'closed' && !approval.approved) return 'dropped';
    if (!approval.approved) return 'awaiting approval';
  }
  return daysUntil(e.date) > 0 ? 'scheduled' : 'ready';
}

function linkedinStatus(issue) {
  if (!issue) return '';
  if (issue.state === 'open') return `[to post](${issue.html_url})`;
  return `[${issue.state_reason === 'not_planned' ? 'skipped' : 'posted'}](${issue.html_url})`;
}

function logBody(rows, state, linkedin) {
  const table = rows.map(({ e, status }) => {
    const done = state.posted[e.id];
    return `| ${e.date} | #${e.id} | ${done ? `[posted](https://x.com/i/status/${done.tweet})` : status} | ${linkedinStatus(linkedin.get(e.id))} | ${e.text.slice(0, 60).replace(/\|/g, '/')}… |`;
  });
  return `Updated by the \`social\` workflow at each run. One tweet posts per weekday at 15:00 UTC: the oldest due one that is ready. Media goes in \`social/media/<id>.mp4\` (or .png/.jpg/.gif); videos need the \`${LABEL.approved}\` label on their approval issue.

| Date | Tweet | Status | LinkedIn | Text |
| --- | --- | --- | --- | --- |
${table.join('\n')}

<!-- state:${JSON.stringify(state)} -->`;
}

async function run(write) {
  if (write) await ensureLabels();
  const { log, state, approvals, linkedin } = await loadGitHub();
  // Only tweets posted from here on get a LinkedIn issue, so switching this on does not backfill the past.
  state.linkedinSince ??= new Date().toISOString();
  const rows = [];
  for (const e of [...QUEUE].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)) {
    const file = mediaFile(e.id);
    let approval = approvals.get(e.id);
    const isVideo = file?.type.startsWith('video/');
    if (write && isVideo && !state.posted[e.id] && !e.hold && daysUntil(e.date) <= LEAD_DAYS) {
      if (!approval) {
        const issue = await gh('POST', '/issues', { title: `Approve tweet #${e.id} for ${e.date} (${e.visual})`, body: approvalBody(e, file), labels: [LABEL.approval] });
        approval = { issue, sha: file.sha, approved: false };
      } else if (approval.sha !== file.sha) {
        await gh('PATCH', `/issues/${approval.issue.number}`, { body: approvalBody(e, file), state: 'open' });
        if (approval.approved) await gh('DELETE', `/issues/${approval.issue.number}/labels/${LABEL.approved}`);
        await gh('POST', `/issues/${approval.issue.number}/comments`, { body: 'The video changed since it was approved. Add the label again to approve the new one.' });
        approval = { ...approval, sha: file.sha, approved: false };
      }
    }
    const status = statusOf(e, file, approval, state);
    if (status === 'dropped' && !state.skipped[e.id]) state.skipped[e.id] = today;
    rows.push({ e, file, approval, status });
  }

  const next = rows.find((r) => r.status === 'ready');
  console.log(rows.filter((r) => r.status !== 'posted' && daysUntil(r.e.date) <= LEAD_DAYS).map((r) => `#${r.e.id} ${r.e.date} ${r.status}`).join('\n') || 'nothing due');
  console.log(next ? `next: #${next.e.id} "${next.e.text.slice(0, 70)}…"${next.file ? ` + ${next.file.rel}` : ''}` : 'nothing to post');

  if (write && next) {
    const mediaId = next.file ? await upload(next.file) : null;
    const { data } = await x('POST', '/2/tweets', { text: next.e.text, ...(mediaId && { media: { media_ids: [mediaId] } }) });
    state.posted[next.e.id] = { tweet: data.id, at: new Date().toISOString() };
    next.status = 'posted';
    console.log(`posted #${next.e.id}: https://x.com/i/status/${data.id}`);
    if (next.approval) {
      await gh('POST', `/issues/${next.approval.issue.number}/comments`, { body: `Posted: https://x.com/i/status/${data.id}` });
      await gh('PATCH', `/issues/${next.approval.issue.number}`, { state: 'closed', state_reason: 'completed' });
    }
  }

  // LinkedIn has no posting API without partner approval, so each posted tweet becomes an issue to post by hand.
  const toLinkedin = rows.filter((r) => state.posted[r.e.id]?.at >= state.linkedinSince && r.e.linkedin !== false && !linkedin.has(r.e.id));
  if (toLinkedin.length) console.log(`linkedin issue for ${toLinkedin.map((r) => `#${r.e.id}`).join(', ')}`);
  if (write) {
    for (const r of toLinkedin) {
      const body = linkedinBody({ ...r.e, tweet: state.posted[r.e.id].tweet }, r.file);
      linkedin.set(r.e.id, await gh('POST', '/issues', { title: `Post to LinkedIn: #${r.e.id} (${r.e.date})`, body, labels: [LABEL.linkedin] }));
    }
  }

  if (!write) return;
  const needs = rows.filter((r) => r.status.startsWith('needs') && daysUntil(r.e.date) <= LEAD_DAYS).map((r) => r.e.id);
  const fresh = needs.filter((id) => !state.needs.includes(id));
  state.needs = needs;
  const body = logBody(rows, state, linkedin);
  const logIssue = log ?? (await gh('POST', '/issues', { title: 'Social posting log', body, labels: [LABEL.log] }));
  if (log) await gh('PATCH', `/issues/${log.number}`, { body });
  if (fresh.length) {
    const lines = rows.filter((r) => fresh.includes(r.e.id)).map((r) => `- #${r.e.id} on ${r.e.date}: add \`social/media/${r.e.id}.${r.e.media === 'video' ? 'mp4' : 'png'}\` (${r.e.visual})`);
    await gh('POST', `/issues/${logIssue.number}/comments`, { body: `Media needed in the next ${LEAD_DAYS} days:\n\n${lines.join('\n')}` });
  }
}

if (MODE === 'check') check();
else if (MODE === 'verify') console.log('X account:', (await x('GET', '/2/users/me')).data);
else if (MODE === 'dry-run') (check(), await run(false));
else if (MODE === 'post') (check(), await run(true));
else throw new Error(`unknown mode ${MODE}`);
