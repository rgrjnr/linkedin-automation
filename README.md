# LinkedIn Automation

Browser automation for LinkedIn using Claude Code and [Playwright CLI](https://www.npmjs.com/package/@playwright/cli). Claude controls a real headed browser with your authenticated LinkedIn session.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Export your LinkedIn cookies

Open Chrome DevTools → **Application tab → Cookies → linkedin.com**. Copy the full cookie table (select all rows, Ctrl+C) and paste into a `.cookies` file. The 6 essential HttpOnly cookies (`li_at`, `JSESSIONID`, `bcookie`, `lidc`, `liap`, `li_mc`) are required.

### 3. Generate the Playwright storage state

```bash
node prepare-storage-state.js
```

This converts `.cookies` into `storage-state.json` (the format Playwright expects).

### 4. Fill in your profile

After `npm install`, a `me/` folder is created with templates:

- **`me/ABOUT_ME.md`** — Your info, skills, and job preferences
- **`me/EXPERIENCE.md`** — Detailed work history
- **`me/cv.pdf`** — Drop your CV here

Fill these in — Claude uses them to tailor applications and cover letters.

### 5. Start a Claude Code session

Open Claude Code in this directory. You can then ask Claude to perform actions on LinkedIn — browse your feed, visit profiles, search for jobs, apply to positions, and more.

## How it works

Claude uses `npx playwright-cli` commands to control a headed Chromium browser:

```bash
npx playwright-cli open --headed          # Open browser
npx playwright-cli state-load storage-state.json  # Load LinkedIn session
npx playwright-cli goto 'https://www.linkedin.com/feed/'  # Navigate
npx playwright-cli snapshot               # Read page content
npx playwright-cli click <ref>            # Interact with elements
```

## Features

- **Job search & applications** — Easy Apply and external ATS (Ashby, Greenhouse, Lever, etc.)
- **Cover letter generation** — Tailored PDF cover letters via `node generate-cover-letter.js`
- **Application tracking** — Log applications to `applications.csv` via `node log-application.js`
- **Profile browsing** — Visit profiles, read feeds, search for people/groups
- **Messaging** — Send messages to connections

## Refreshing cookies

LinkedIn cookies last ~30 days. When your session expires (you'll see login prompts or 403 errors), repeat steps 2 and 3.

## Files

| File | Description |
|------|-------------|
| `prepare-storage-state.js` | Converts `.cookies` to Playwright's `storage-state.json` |
| `generate-cover-letter.js` | Generates a tailored PDF cover letter |
| `log-application.js` | Logs a job application to `applications.csv` |
| `CLAUDE.md` | Instructions for Claude Code on how to use the automation |
| `me/` | Your profile, experience, and CV (not tracked in git) |

## License

ISC
