const fs = require("fs");
const PDFDocument = require("pdfkit");

// Usage: node generate-cover-letter.js "Company Name" "cover letter text"
// The cover letter text can include \n for line breaks.
// Output: "Roger Junior - Company Name Cover Letter.pdf"

const [, , company, text] = process.argv;

if (!company || !text) {
  console.error(
    'Usage: node generate-cover-letter.js "Company Name" "Your cover letter text here"'
  );
  process.exit(1);
}

const dir = "cover-letters";
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const output = `${dir}/Roger Junior - ${company} Cover Letter.pdf`;
const doc = new PDFDocument({
  size: "A4",
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
});

const stream = fs.createWriteStream(output);
doc.pipe(stream);

// Header
doc.fontSize(11).font("Helvetica-Bold").text("Roger Junior", { align: "left" });
doc
  .fontSize(9)
  .font("Helvetica")
  .text("Lisboa, Portugal | roger@rogerjunior.com | linkedin.com/in/rogerjunior", {
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
