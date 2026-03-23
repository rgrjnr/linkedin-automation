const fs = require("fs");

const CSV_FILE = "applications.csv";
const HEADERS = "date,job_title,company,location,type,url,notes";

// Usage: node log-application.js "Job Title" "Company" "Location" "Remote|Hybrid|Onsite" "/jobs/view/123456/" "optional notes"
const [, , title, company, location, type, url, notes] = process.argv;

if (!title || !company) {
  console.error(
    'Usage: node log-application.js "Job Title" "Company" "Location" "Remote|Hybrid|Onsite" "/jobs/view/ID/" "notes"'
  );
  process.exit(1);
}

const csvEscape = (str) => {
  if (!str) return "";
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const date = new Date().toISOString().split("T")[0];
const row = [date, title, company, location, type, url, notes]
  .map(csvEscape)
  .join(",");

if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, HEADERS + "\n");
}

fs.appendFileSync(CSV_FILE, row + "\n");
console.log(`Logged: ${title} @ ${company}`);
