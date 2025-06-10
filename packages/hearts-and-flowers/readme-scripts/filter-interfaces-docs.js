import fs from "fs";
import path from "path";

function filterInterfaceDocs(filename) {
  const docsInterfacePath = path.join(
    new URL("../docs/interfaces", import.meta.url).pathname,
    `${filename}.md`
  );
  const content = fs.readFileSync(docsInterfacePath, "utf-8");
  const startMarker = /^# Interface.*/m;

  const startIndex = content.search(startMarker);
  if (startIndex === -1) return ""; // Return empty string if startMarker is not found

  // Return content starting from startMarker to the end
  const filteredInterfaceDocs = content.slice(startIndex).trim();

  if (filteredInterfaceDocs) {
    fs.writeFileSync(docsInterfacePath, filteredInterfaceDocs);
  }
  // If filtered content returns nothing, keep the original content
}

// Apply filterInterfaceDocs to all .md files in ../docs/interfaces
const docsInterfacesDir = new URL("../docs/interfaces", import.meta.url).pathname;
const mdFiles = fs.readdirSync(docsInterfacesDir).filter((file) => file.endsWith(".md"));

mdFiles.forEach((file) => {
  filterInterfaceDocs(file.replace(".md", ""));
});

// After processing all files, append linked file contents and update links
mdFiles.forEach((file) => {
  const currentFilePath = path.join(docsInterfacesDir, file);
  let content = fs.readFileSync(currentFilePath, "utf-8");

  const linkRegex = /([\w-]+\.md)/g; // Match links to .md files in the same directory
  let match;
  let appendedContent = "";

  while ((match = linkRegex.exec(content)) !== null) {
    const linkedFileName = match[1];
    const linkedFilePath = path.join(docsInterfacesDir, linkedFileName);

    if (fs.existsSync(linkedFilePath)) {
      const linkedFileContent = fs.readFileSync(linkedFilePath, "utf-8");
      appendedContent += `\n\n---\n\n${linkedFileContent}`;

      // Update the link in the current file to point to the appended content
      const updatedLink = `#${linkedFileName.replace(".md", "")}`;
      content = content.replace(match[0], updatedLink);
    }
  }

  // Write the updated content back to the current file
  if (appendedContent) {
    fs.writeFileSync(currentFilePath, content + appendedContent);
  }
});


