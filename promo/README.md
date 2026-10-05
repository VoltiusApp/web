# Voltius promo videos

Remotion project for the marketing videos. Compositions (`src/Root.tsx`):

| id | what | source |
|---|---|---|
| `Demo` | README / landing hero demo (~40 s, 1600×900) | `src/demo/`, footage `public/demo/` |
| `Trailer` | 30 s launch trailer | `src/Trailer.tsx`, footage `public/footage/` |
| `DeviceSync` | 3D laptop + phone, one session live on both (~18 s) | `src/devices/`, devices + scene in `../shared/devices/` (also used by the landing), footage `public/devices/` |
| `ImportClip` | import from `source`: `termius`, `mobaxterm`, `putty`, `securecrt`, `zoc`, `csv`, or `supercut` (all six) | `src/social/`, takes `public/social/import-*` |
| `FirstRun` | no account: chooser → add a host → connect | takes `cold1`, `cold2` |
| `KillRestore` | kill -9 mid-build, relaunch, workspace and build still there | take `kill` |
| `Broadcast` | twelve hosts, broadcast on, one `apt upgrade` everywhere | take `broadcast` (1920×1200) |
| `ThemeSpeedrun` | the six built-in themes from the side panel | take `themes` |
| `ResumeTransfer` | 4 GB folder upload, link drops, transfer resumes | take `resume` |
| `SyncClip` | the landing's E2EE sync scene; `store`: `cloud` (Pro) or `byo` | `../shared/devices/SyncScene.tsx`, stills `public/sync/` |

## Tweet videos

`social.json` maps tweet ids from `../social/queue.json` to a composition and its props.

```bash
npm ci --cache .npm-cache          # once per fresh copy
npm run render:all                 # renders what is missing in out/social/<id>.mp4 (--gl=angle)
npm run render:all -- --only 1,23  # re-render some
npm run render:all -- --force      # re-render everything
```

It prints the list in posting order (and the video tweets that have no composition yet) and writes `out/social/review.html`: each video beside its tweet text. To approve one, copy it to `social/media/<id>.mp4`, push, then label the tweet's "Approve tweet #N" issue `approved`.

Clips frame the footage on the 2.5D laptop (`FirstRun`, `KillRestore`) or as a floating app window (the rest); the device and camera shots live in `src/social/FootageClip.tsx`. Cuts and captions are relative to the marks in `src/social/takes/*.json`, so a retake keeps the edit.

### Retaking the tweet footage

Everything runs in one capture container, `promo-social`, on its own network with a 12-host Debian fleet (`promo-s-web-01` … `promo-s-worker-02`, `deploy`/`deploy`; an older Debian release so `apt upgrade` has work to do).

```bash
cd capture/social
WT=<voltius worktree at the release> BIN=<dir with its debug binary> ./setup.sh
./take-import.sh termius mobaxterm putty securecrt zoc csv   # import-*
./vault-fleet.sh && ./resume.sh rec                          # resume (≈8 min of real transfer)
./kill.sh                                                     # kill
./themes.sh                                                   # themes
FLAT=1 ./vault-fleet.sh && WT=… BIN=… ./broadcast.sh          # broadcast, recreates the fleet first
```

`cold1.mjs`/`cold2.mjs` need a never-launched app: record them first on a fresh container (`./rec.sh cold1.mjs cold1`, `./rec.sh cold2.mjs cold2`, then `./pull.sh cold1 cold2`). Every take script ends with `pull.sh`, which copies the recording to `public/social/` and writes `src/social/takes/<take>.json`.

- PuTTY, SecureCRT and ZOC import from real config files `sources.mjs` writes where the Linux app looks. Termius and MobaXterm can't run here: `stubs.mjs` replaces only their native read with records in their real formats; the parsers and the import UI are the app's own.
- Competitor brand icons on the importer buttons are hidden during capture (`nologo.js`).
- The link drop is `docker pause` on the host: a blackhole like a dead Wi-Fi link, while the name still resolves (`docker network disconnect` breaks DNS and the app gives up).
- Never `pkill -f` a pattern that appears in your own command line; kill the app with `pkill -x voltius`.
- Half-scale stills here: `node stills.mjs <Composition> <frame>…` (`PROPS='{"source":"putty"}'` for props). They use `--gl=swangle`; other software GL paths draw the 3D devices with the wrong faces in front.

## Retaking the README demo

Everything is scripted; a retake after UI changes is:

```bash
./retake.sh          # setup fleet + files, record take A and B, rebuild src/demo/data.json  (~4 min)
node stills.mjs Demo 20 70 120 ...   # spot-check frames in frames/ (optional)
./encode-demo.sh     # render + out/demo.webp (README) + out/demo.mp4 (landing)
```

Then publish:
- **README**: drag `out/demo.webp` into a GitHub comment/editor to get a `user-attachments` URL, replace the `<img src>` in the voltius repo's `README.md`. Keep it under 10 MB (`WEBP_Q=50 ./encode-demo.sh` if not).
- **Landing**: `out/demo.mp4` replaces `demo.mp4` in R2 bucket `voltius-assets` (public at `pub-8ed71dde1bad496f9df2b3f5a84b69df.r2.dev`, referenced by `landing/app/components/Hero.tsx`). wrangler's own login expires; the OpenTofu token can write the bucket:
  ```bash
  ( set -a; . ~/fourretout/voltius-tofu/.env.tofu; set +a; CLOUDFLARE_ACCOUNT_ID=$TF_VAR_account_id \
    wrangler r2 object put voltius-assets/demo.mp4 --file out/demo.mp4 --content-type video/mp4 --remote )
  ```

## Retaking the device-sync clip

Two real Voltius instances record one persistent session at the same time: `promo-laptop` (desktop) and `promo-phone` (the mobile shell, forced with `localStorage["promo:platform"]="android"` from `capture/devices/platform.patch`, window shrunk past the 800 px minimum with xdotool). Both sign into one account on an isolated `promo-sync-server`, never prod.

```bash
WT=<voltius worktree> BIN=<dir with a voltius debug binary> ./capture/devices/setup.sh   # server, containers, account, host, phone on Hosts
./capture/devices/take.sh      # records both, writes public/devices/*.mp4 + src/devices/take.json
npx remotion render DeviceSync out/devices/device-sync.mp4 --gl=angle   # on the 5070 PC
```

- Cuts, camera keys and captions in `src/devices/DeviceSync.tsx` are relative to the marks in `take.json`.
- The device name on the phone's "Live on other devices" card is the laptop container's hostname (`work-laptop`).
- A stale card from a removed container clears when joined once (attach fails, the session is tombstoned); `phone-home.js` does that.
- Render on the 5070 PC (`--gl=angle`, full HD: ~30 s); on this box software GL takes hours, and two tabs time out extracting video frames.

### How it works

1. **Capture** (`capture/demo/`, runs inside the `tauri-promo` container from `/tmp/work`):
   - `setup.sh` (host): starts/creates the fake fleet `promo-{web-01,web-02,db-primary,cache-01}` (linuxserver openssh, `deploy`/`deploy`, port 2222), installs the fake `docker` CLI on web-01 (`fleet/docker`, feeds the Docker panel), creates the SFTP files, writes `/etc/hosts` aliases for the extra host names, copies the scripts to `/tmp/work`.
   - `reset.mjs`: reloads the webview, empties the vault, Voltius theme, 1280×800 window.
   - `takeA.mjs`: Termius import → connect web-01 → `docker ps` → side panel (snippet, Docker, Light → Dracula) → Ctrl+K db-primary → drag tab to split.
   - `prep_sftp.mjs`: off camera, points the SFTP panes at `~/Projects/acme-api` and `web-01:~/releases`.
   - `takeB.mjs`: open SFTP, drag `release-v2.5.0.tar.gz` across.
   - `rec.sh` records each take with x11grab (`-copyts` keeps wall-clock pts) and saves `X.mp4`, `X.start`, `X.cursor` (pointer path), `X.marks` (named moments).
   - The mouse is real (xdotool), so hovers, drags and drop zones are genuine; the recording hides the X cursor and Remotion draws a bigger one from `X.cursor`.
   - **Termius is stubbed** (`stub.mjs`): only the importer's local-data read is replaced with fake fleet records; the import UI itself is real.
   - **When the UI moves**, fix the selectors in `ui.mjs` — every app-specific target lives there. Text targets (`clickText('From Termius')`) assume the English locale.
2. **Edit** (`src/demo/`): `timeline.ts` = cuts and speed per segment, all relative to marks; `Demo.tsx` = camera zooms (`CAM`), captions (`CAPTIONS`), cursor, background, end card. Re-tune rates there if a step gets slower/faster.

### Capture container

`tauri-promo` is a private copy of the headless stack: the app built from the `.claude/worktrees/promo-capture` worktree of the voltius repo (mounted at `/app`, vite on 1420, binary at `/tmp/work/voltius-bin`), Xvfb 1920×1200, tauri-driver on 4444, `WEBKIT_DISABLE_COMPOSITING_MODE=1`, `seccomp=unconfined`, on network `voltius-headless_voltius-test`. Update that worktree to the commit you want to show (`git -C <worktree> checkout <sha>`) before a retake. If the container is gone, recreate it per the voltius repo's headless docs (`compose.headless.yml`, skill `capturing-voltius-media`).

### Gotchas

- The box has 2 cores: the import step takes ~15 s on camera; the edit runs it at 8×. Don't record while big builds run if you can avoid it.
- WebDriver clicks don't move the X pointer and WebDriver drags deliver nothing; drags must go through xdotool as separate process calls (`mouse.mjs`).
- A hot reload of `src/` while the SFTP page is open kills its session ("SFTP session … not found"); `reset.mjs` does a full reload first.
- Remotion's bundled ffmpeg lacks filters; encoding uses the container's ffmpeg (`libwebp_anim`).
