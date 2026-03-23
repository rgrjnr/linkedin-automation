const fs = require("fs");

const lines = fs.readFileSync(".cookies", "utf-8").trim().split("\n");

const cookies = lines
  .map((line) => {
    const [name, value, domain, path, expires, _size, httpOnly, secure, sameSite] =
      line.split("\t");
    if (!name || !domain) return null;
    // Only include LinkedIn cookies
    if (!domain.includes("linkedin.com")) return null;
    return {
      name,
      value,
      domain,
      path: path || "/",
      expires:
        expires === "Session" || !expires
          ? -1
          : Math.floor(new Date(expires).getTime() / 1000),
      httpOnly: httpOnly === "✓",
      secure: secure === "✓",
      sameSite: sameSite === "None" ? "None" : sameSite === "Lax" ? "Lax" : "Strict",
    };
  })
  .filter(Boolean);

const storageState = {
  cookies,
  origins: [],
};

fs.writeFileSync("storage-state.json", JSON.stringify(storageState, null, 2));

console.log(`Converted ${cookies.length} cookies to Playwright storage state format.`);
