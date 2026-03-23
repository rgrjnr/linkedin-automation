const fs = require("fs");
const PDFDocument = require("pdfkit");

// Usage: node generate-cover-letter.js "Company Name" "cover letter text"
// The cover letter text can include \n for line breaks.
// Output: "cover-letters/Company Name Cover Letter.pdf"

const [, , company, text] = process.argv;

if (!company || !text) {
  console.error(
    'Usage: node generate-cover-letter.js "Company Name" "Your cover letter text here"'
  );
  process.exit(1);
}

const dir = "cover-letters";
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
// Load user profile from ABOUT.md for header info
let userName = "Your Name";
let userDetails = "Location | email@example.com | linkedin.com/in/yourprofile";
try {
  const about = fs.readFileSync("me/ABOUT_ME.md", "utf-8");
  const nameMatch = about.match(/^#\s*About\s+(.+)/im);
  if (nameMatch) userName = nameMatch[1].trim();
  const emailMatch = about.match(/Email:\s*(.+)/i);
  const locationMatch = about.match(/Location:\s*(.+)/i);
  const linkedinMatch = about.match(/linkedin\.com\/in\/[\w-]+/i);
  const parts = [locationMatch, emailMatch, linkedinMatch].filter(Boolean).map(m => m[1] || m[0]);
  if (parts.length) userDetails = parts.join(" | ");
} catch (e) {
  console.warn("Warning: me/ABOUT_ME.md not found. Run 'npm install' to generate templates, then fill in your info.");
}

const output = `${dir}/${userName} - ${company} Cover Letter.pdf`;
const doc = new PDFDocument({
  size: "A4",
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
});

const stream = fs.createWriteStream(output);
doc.pipe(stream);

// Header
doc.fontSize(11).font("Helvetica-Bold").text(userName, { align: "left" });
doc
  .fontSize(9)
  .font("Helvetica")
  .text(userDetails, {
    align: "left",
  });

doc.moveDown(1.5);

// Date
const date = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
doc.fontSize(10).text(date);
doc.moveDown(1);

// Body — split on literal \n or actual newlines
const paragraphs = text.replace(/\\n/g, "\n").split("\n");
doc.fontSize(10).font("Helvetica");
for (const paragraph of paragraphs) {
  const trimmed = paragraph.trim();
  if (trimmed === "") {
    doc.moveDown(0.5);
  } else {
    doc.text(trimmed, { lineGap: 3 });
    doc.moveDown(0.5);
  }
}

doc.end();

stream.on("finish", () => {
  const size = fs.statSync(output).size;
  const kb = Math.round(size / 1024);
  console.log(`Generated ${output} (${kb} KB)`);
});
