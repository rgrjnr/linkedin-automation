const fs = require("fs");
const path = require("path");

const ME_DIR = "me";
const FILES = {
  "ABOUT_ME.md": `# About Me

## Basic Info
- **Full Name**:
- **Email**:
- **Phone**:
- **Location**:
- **LinkedIn**: https://www.linkedin.com/in/your-profile/

## What kind of jobs are you looking for?
<!-- e.g., "Senior Frontend Engineer roles at product companies, remote or hybrid in Lisbon" -->


## What are your top skills?
<!-- List your strongest technical and soft skills -->
-
-
-

## What are you really good at?
<!-- What sets you apart? What do people come to you for? -->


## What industries or domains interest you?
<!-- e.g., fintech, developer tools, AI/ML, healthcare -->


## Job preferences
- **Work model**: <!-- Remote / Hybrid / On-site -->
- **Visa sponsorship needed**: <!-- Yes / No -->
- **Desired seniority**: <!-- Junior / Mid / Senior / Lead / Staff -->
- **Preferred company size**: <!-- Startup / Mid-size / Enterprise / No preference -->
`,

  "EXPERIENCE.md": `# Professional Experience

<!--
  Detail your work experience below. Be thorough — Claude uses this to
  tailor cover letters and answer application questions.
  Include: role, company, dates, what you did, technologies used, and impact.
-->

## [Job Title] — [Company Name]
**[Start Date] – [End Date]** | [Location]

- What you did and accomplished
- Technologies and tools used
- Key metrics or impact

---

## [Job Title] — [Company Name]
**[Start Date] – [End Date]** | [Location]

- What you did and accomplished
- Technologies and tools used
- Key metrics or impact

---

<!-- Add more roles as needed. The more detail, the better Claude can
     represent you in applications and cover letters. -->
`,
};

// Only scaffold if the /me directory doesn't already exist
if (fs.existsSync(ME_DIR)) {
  console.log(`✓ ${ME_DIR}/ already exists — skipping setup.`);
  process.exit(0);
}

fs.mkdirSync(ME_DIR);

for (const [filename, content] of Object.entries(FILES)) {
  const filepath = path.join(ME_DIR, filename);
  fs.writeFileSync(filepath, content);
  console.log(`  Created ${filepath}`);
}

console.log(`
✓ Created ${ME_DIR}/ with your profile templates.

Next steps:
  1. Fill in me/ABOUT_ME.md with your info and job preferences
  2. Fill in me/EXPERIENCE.md with your work history
  3. Drop your CV as me/cv.pdf
  4. Export your LinkedIn cookies into .cookies (see README.md)
  5. Run: node prepare-storage-state.js
`);
