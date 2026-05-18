# Backend setup (Google Sheet + Apps Script)

The punch card app stores per-user state in a single Google Sheet, with a tiny
Apps Script Web App in front of it for read/write.

Free, no servers, no auth tokens in client code. ~5 min to set up.

## One-time setup

1. **Create a sheet.** Go to <https://sheets.new>. Name it something like
   "Berta punch cards". Leave it empty — the script will populate it on first
   write.

2. **Open the script editor.** In the sheet: `Extensions` → `Apps Script`.

3. **Paste the script.** Copy the entire contents of `Code.gs` (this folder)
   into the editor, replacing whatever's there. Save (⌘S / Ctrl-S).

4. **Deploy as a Web App.**
   - Top right: `Deploy` → `New deployment`.
   - Click the gear icon next to "Select type" → choose `Web app`.
   - Description: anything (e.g. "berta v1").
   - Execute as: **Me** (your account).
   - Who has access: **Anyone**.
   - Click `Deploy`.
   - First time: Google will ask you to authorize the script. Approve.
     (The scary "unsafe" warning is normal for unverified personal scripts —
     it's your own script calling your own sheet.)
   - Copy the **Web app URL** that appears at the end. It looks like:
     `https://script.google.com/macros/s/AKfy.../exec`

5. **Wire the frontend to the URL.** In `src/app.js` near the top:

   ```js
   var BACKEND_URL = "https://script.google.com/macros/s/AKfy.../exec";
   ```

   Commit + ship. The next punch will write a row to the sheet.

## Verifying it works

After deploying, paste the URL into a browser with `?action=get&code=ABCDEF`
appended. You should get JSON: `{"ok":false}` (no such code yet — that's fine).

After punching once on the live site, open the sheet — there should be one row
with your 6-char code, the state JSON, and a timestamp.

## Updating the script later

If you edit `Code.gs`, you need to redeploy:
- `Deploy` → `Manage deployments` → pencil icon → `Version: New version` → `Deploy`.
- The URL stays the same. **Do not** create a new deployment — that gives you a
  new URL and would orphan existing user data references.

## Schema

One row per customer, one column per tab. Flat shape — readable, sortable,
manually editable.

| A (code) | B (coffee) | C (pizza) | D (sandwich) | E (updated_at)             |
| -------- | ---------- | --------- | ------------ | -------------------------- |
| `Q8DR37` | 3          | 0         | 1            | `2026-05-18T20:13:42.123Z` |

Tab order is defined by `TAB_KEYS` at the top of `Code.gs` and must mirror
`TABS` in `src/app.js`. The script auto-writes the header row on a blank
sheet — to change the columns, clear row 1 and let the next write rebuild it.

The wire format with the client is still object-wrapped to leave room for
future per-tab fields:

```json
{ "coffee": { "punches": 3 }, "pizza": { "punches": 0 }, "sandwich": { "punches": 1 } }
```

Shape arrangements (the geometric layout on the card) are **not** stored
here — they're presentation, kept per-device in `localStorage`. The backend
only knows punch counts.

## Security & caveats

- The Apps Script URL is effectively a "key" — anyone who has it can read/write
  any user's state if they know (or can guess) a 6-char code. Code space is
  32^6 ≈ 1.07 billion (alphabet excludes 0/O and 1/I), so guessing is
  impractical, but it is not strong auth.
  Fine for a small-cafe loyalty card; not fine for anything sensitive.
- Apps Script free quota is plenty for this scale (thousands of requests/day).
- If you ever leak the URL and want to invalidate it, create a new deployment
  → update `BACKEND_URL` in `src/app.js` → ship. Old deployments keep serving
  unless you delete them from `Manage deployments`.
