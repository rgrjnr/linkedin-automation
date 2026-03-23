# LinkedIn Automation

## What this project is

Browser automation for LinkedIn using Playwright CLI (`playwright-cli`). Claude controls a real headed browser with the user's authenticated LinkedIn session via terminal commands.

## How it works

1. The user's LinkedIn cookies are stored in `.cookies` (tab-separated format copied from Chrome DevTools Application tab)
2. `prepare-storage-state.js` converts them to Playwright format in `storage-state.json`
3. Claude uses `npx playwright-cli` commands to control a headed browser and interact with LinkedIn

## Playwright CLI usage

All browser automation is done via `npx playwright-cli <command>`. Key workflow:

```bash
# 1. Open a headed browser
npx playwright-cli open --headed

# 2. Load the LinkedIn session
npx playwright-cli state-load storage-state.json

# 3. Navigate, interact, extract data
npx playwright-cli goto 'https://www.linkedin.com/...'
npx playwright-cli snapshot          # get page content and element refs
npx playwright-cli click <ref>       # click an element by ref
npx playwright-cli fill <ref> <text> # fill a form field
npx playwright-cli type <text>       # type text into focused element
npx playwright-cli screenshot        # take a screenshot
```

### Useful commands

| Command | Description |
|---------|-------------|
| `open --headed` | Open a visible browser |
| `close` | Close the browser |
| `goto <url>` | Navigate to a URL |
| `snapshot` | Capture page snapshot (get element refs) |
| `click <ref>` | Click an element |
| `fill <ref> <text>` | Fill a form field |
| `type <text>` | Type text |
| `screenshot [ref]` | Take a screenshot |
| `state-load <file>` | Load storage/auth state |
| `press <key>` | Press a keyboard key |
| `tab-list` | List open tabs |
| `tab-new [url]` | Open a new tab |

## Common tasks

### Finding LinkedIn groups

1. `goto 'https://www.linkedin.com/search/results/groups/?keywords=computer%20science'`
2. `snapshot` to see results and get element refs
3. Extract group names, descriptions, and member counts from the snapshot
4. `click <ref>` to go into groups for more details

### Browsing the feed

1. `goto 'https://www.linkedin.com/feed/'`
2. `snapshot` to read content

### Visiting a profile

1. `goto 'https://www.linkedin.com/in/{username}/'`
2. `snapshot` to extract profile data

### Searching for people, jobs, or content

1. `goto 'https://www.linkedin.com/search/results/all/?keywords={query}'`
2. `snapshot` and use `click` to navigate filters (People, Jobs, Posts, Groups, etc.)

### Sending a message

1. Navigate to the person's profile
2. `click` the "Message" button (use ref from snapshot)
3. `fill` or `type` the message content
4. `click` send

### Applying to jobs (Easy Apply / Candidatura Simplificada)

1. `goto 'https://www.linkedin.com/jobs/collections/easy-apply/?discover=recommended&discoveryOrigin=JOBS_HOME_JYMBII'`
2. `snapshot` to see the job list. Filter tabs: "Para você", "Candidatura simplificada", "Remotas", etc.
3. Click a job to open the detail panel on the right side
4. Click the "Candidatura simplificada à vaga de..." button to open the application modal
5. The Easy Apply form has multiple steps (progress bar shows %):
   - **Contact info** (0%): Name, phone, email, location (pre-filled). Location is a combobox — type a city and select from the dropdown suggestions.
   - **CV / Resume** (17%): Select from previously uploaded CVs or upload new one. The most recent CV is usually pre-selected.
   - **Cover letter** (33%): Optional upload. Generate one with `node generate-cover-letter.js "text"` (outputs `cover-letter.pdf`), then upload via the file upload button. See "Cover letter generation" section below.
   - **Work experience** (50%): Pre-filled from LinkedIn profile. Review and proceed.
   - **Education** (67%): Pre-filled from LinkedIn profile. Review and proceed.
   - **Additional questions** (83%): Company-specific questions (e.g., privacy policy checkboxes). These vary by company.
   - **Review** (100%): Final review page with "Enviar candidatura" (Submit) button.
6. After submitting, the URL changes to `/post-apply/next-best-action/`. Close or navigate away.
7. After each application, run `node log-application.js` with the job details to track it in `applications.csv`.

**Key UI elements (in Portuguese):**
- "Candidatura simplificada" = Easy Apply
- "Avançar" = Next
- "Voltar" = Back
- "Revisar" = Review
- "Enviar candidatura" = Submit application
- "Candidatou-se" = Already applied
- "Promovida" = Promoted/Sponsored
- "Avaliando candidaturas" = Reviewing applications
- "Vaga verificada" = Verified job

**Tips:**
- Already-applied jobs show "Candidatou-se" in the list — skip these.
- Some companies use external ATS (SmartRecruiters, Greenhouse, etc.) which may show form labels in other languages (Italian, Spanish, English).
- The form steps and count vary by company — some have fewer steps, some have more custom questions.
- Always check for required fields (marked with `*`) before clicking "Avançar".

## Subagent workflow for bulk applications

When applying to multiple jobs, **always use a subagent for each application** to avoid filling the main conversation's context window. The main agent should:

1. Open the browser, load session, and navigate to the jobs list
2. Take a snapshot and identify design-related jobs to apply to
3. For each job, spawn a **sequential** subagent (not parallel — they share the same browser) with a prompt like:

```
Apply to the job currently visible in the browser. The job is: "[Job Title]" at "[Company]".

Instructions:
- Read ABOUT.md for profile context
- Read CLAUDE.md for the Easy Apply flow
- Click on the job in the list (ref: [ref]) to open the detail panel
- Click the Easy Apply button and complete all form steps
- If there's a cover letter step, generate one using: node generate-cover-letter.js "cover letter text"
  Write a tailored cover letter based on the job description (from the snapshot) and ABOUT.md
  Then upload the generated "Roger Junior - Company Name Cover Letter.pdf" via the file upload button in the form
- After submitting, log the application: node log-application.js "Title" "Company" "Location" "Type" "URL" "notes"
- Report back: success/failure, job title, company, and any issues encountered
```

4. Wait for each subagent to finish before spawning the next one (they share the browser)
5. After all applications are done, summarize results to the user

This keeps the main context clean — each application involves many snapshots and form interactions that would otherwise consume the context window.

## Cover letter generation

Generate a tailored PDF cover letter for each application:

```bash
node generate-cover-letter.js "Company Name" "Dear Hiring Manager,\n\nYour cover letter text here...\n\nBest regards,\nRoger Junior"
```

- Outputs `Roger Junior - Company Name Cover Letter.pdf`
- The PDF includes Roger's name, location, email, LinkedIn URL, and the current date as a header
- Must be under 512 KB (LinkedIn's limit for cover letters)
- Write the cover letter based on: the **job description** (from the snapshot) + **ABOUT.md** (profile/skills)
- Keep it concise: 3-4 paragraphs, tailored to the specific role and company
- Highlight relevant experience from ABOUT.md that matches the job requirements

## Applying to jobs (External ATS / "Candidatar-se no site da empresa")

Non-Easy Apply jobs show a **"Candidatar-se no site da empresa"** button instead of "Candidatura simplificada". These redirect to external ATS platforms (Ashby, Greenhouse, Lever, SmartRecruiters, Workday, etc.).

### Flow

1. On the job detail page, click the **"Candidatar-se no site da empresa"** button
2. LinkedIn shows a **"Gostaria de compartilhar seu perfil?"** dialog — click **"Continuar"**
3. The external ATS opens in a **new tab**
4. **Tab switching workaround**: `tab-select` doesn't properly switch the page context in playwright-cli. Close the LinkedIn tab with `tab-close 0` to make the external tab the active one, OR navigate directly to the external URL with `goto`
5. Fill the external form using `fill`, `click`, `upload` commands as usual
6. For file uploads on external sites: click the upload button first to trigger the file chooser modal, then use `upload <filepath>`
7. Submit the application
8. Log with `node log-application.js` — add "External application via [ATS name]" in notes

### Key differences from Easy Apply

- Each company's form is completely different — different fields, different platforms
- Forms are typically in English (not Portuguese)
- No multi-step flow — usually a single page with all fields
- Resume must be uploaded as a file (not pre-selected from LinkedIn)
- Custom questions vary widely (e.g., "Why do you want to work here?", "Do you need sponsorship?")
- No LinkedIn profile data is pre-filled — must enter name, email, LinkedIn URL manually

### Common form fields to fill

Use data from **ABOUT.md** for these:
- **Full Name**: Roger Junior
- **Email**: roger@rogerjunior.com
- **Phone**: +351 915 708 522
- **LinkedIn URL**: https://www.linkedin.com/in/rogerjunior/
- **Location**: Lisbon, Portugal
- **Sponsorship needed**: No
- **Resume**: Upload `ROGERJUNIOR_ENGLISH_CV_2025.pdf`

### Known ATS platforms

| Platform | URL pattern | Notes |
|----------|------------|-------|
| Ashby | `jobs.ashbyhq.com` | Single-page form, combobox for location |
| Greenhouse | `boards.greenhouse.io` | Multi-section form |
| Lever | `jobs.lever.co` | Single-page form |
| SmartRecruiters | `jobs.smartrecruiters.com` | Multi-step form |
| Workday | `*.wd*.myworkdayjobs.com` | Complex multi-page form |

## Important notes

- **Always use headed mode**: Open the browser with `open --headed` so the user can see what's happening.
- **Cookie export**: Cookies must be exported from Chrome DevTools **Application tab → Cookies** (not `document.cookie` in console). The 6 essential HttpOnly cookies (`li_at`, `JSESSIONID`, `bcookie`, `lidc`, `liap`, `li_mc`) are invisible to JavaScript. Copy the full table with tab separators into `.cookies`.
- **Session expiry**: Cookies last ~30 days. If actions fail with login prompts or you see cascading 403 errors on Voyager API calls, the user needs to re-export cookies.
- **403 reload loop**: If LinkedIn starts refreshing infinitely, it means the Voyager API calls are getting 403s (session/CSRF mismatch). Close the browser, re-export fresh cookies, run `node prepare-storage-state.js`, and reopen.
- **Rate limits**: LinkedIn may throttle or block automated activity. Space out actions and avoid bulk operations. Don't navigate to multiple pages in rapid succession.
- **Language**: The user's LinkedIn is in Portuguese (pt-br), so page elements and text will be in Portuguese.
- **Always snapshot** after navigation to verify the page loaded correctly and the session is valid.
- **LinkedIn URLs**: Always use `www.linkedin.com` as the base domain.
