// generate-svg-dictionary.js
const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '../svg');
const outputFile = path.join(__dirname, 'svg-dictionary.ts');

const svgFiles = fs.readdirSync(svgDir).filter(file => file.endsWith('.svg'));

let dictionaryContent = `/**
 * These SVGs come from the open source project boxicons (https://boxicons.com/)
 * 
 */
export default const svgDictionary = {
`;

svgFiles.forEach(file => {
  const fileName = path.basename(file, '.svg');
  const content = fs.readFileSync(path.join(svgDir, file), 'utf8');
  
  // Escape any backticks in the SVG content
  const escapedContent = content.replace(/`/g, '\\`');
  
  dictionaryContent += `  "${fileName}": \`${escapedContent}\`,\n`;
});

dictionaryContent += `};
`;

fs.writeFileSync(outputFile, dictionaryContent);
console.log(`SVG dictionary created with ${svgFiles.length} entries.`);