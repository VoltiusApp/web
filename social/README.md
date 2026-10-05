# Social posting

`queue.json` holds every planned tweet with its date. The `social` workflow runs at 15:00 UTC on weekdays and posts **one** tweet: the oldest due one that is ready. Nothing is ever posted twice; state lives in the "Social posting log" issue.

- **Text-only tweets** post on their date.
- **Tweets with a visual** wait for the file at `social/media/<id>.mp4` (or `.png`, `.jpg`, `.gif`, `.webp`, `.mov`). Images post as soon as they are there and the date has come.
- **Videos need approval.** Five days before the date (or as soon as the file lands, if later) the workflow opens an issue "Approve tweet #N …" linking the video. Add the `approved` label to let it post; close the issue without the label to drop the tweet. Replacing the video removes the approval.
- A tweet whose date passed while it waited posts on the next run, before that day's own tweet.
- `hold` in `queue.json` keeps a tweet back until the field is removed.

Run it by hand from Actions → social → Run workflow: `verify` checks the X keys, `dry-run` reports what would happen, `post` posts now. Locally: `node social/post.mjs check` validates the queue.

Secrets (repository settings → Secrets and variables → Actions): `X_API_KEY`, `X_API_SECRET` (the app's consumer keys) and `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` (your account's access token, generated after setting the app to "Read and write").
