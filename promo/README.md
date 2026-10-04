# Voltius promo videos

Remotion project for the marketing videos. Compositions (`src/Root.tsx`):

| id | what | source |
|---|---|---|
| `Demo` | README / landing hero demo (~40 s, 1600×900) | `src/demo/`, footage `public/demo/` |
| `Trailer` | 30 s launch trailer | `src/Trailer.tsx`, footage `public/footage/` |
| `ImportClip` | import-focused social clip | `src/ImportClip.tsx` |

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
