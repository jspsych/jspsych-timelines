import fs from 'fs';
import path from 'path';

function filterCreateTimelineDocs(content) {
  function filterParametersTable(content) {
    const startMarker = '# Function: createTimeline()';
    const endMarker = '## Returns';
    const nextHeadingRegex = /^##\s+/m;
    
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return content;
    
    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex === -1) return content;
    
    const nextHeadingIndex = content.slice(endIndex).search(nextHeadingRegex);
    const sliceEnd = nextHeadingIndex === -1 ? content.length : endIndex + nextHeadingIndex;
    
    return content.slice(startIndex, sliceEnd).trim();
  }
  
  function filterReturnsTable(content) {
    const startMarker = '## Returns';
    const headingRegex = /^#+\s/m;  // Matches any number of # followed by a space
    
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return content;
    
    // Find the index of the next heading after Returns
    const nextHeadingIndex = content.slice(startIndex + startMarker.length).search(headingRegex);
    
    // If no next heading is found, return content from Returns to the end
    if (nextHeadingIndex === -1) {
      return content.slice(startIndex).trim();
    }
    
    // Return content from Returns up to the start of the next heading
    return content.slice(startIndex, startIndex + startMarker.length + nextHeadingIndex).trim();
  }
  
  return filterParametersTable(content) + '\n\n' + filterReturnsTable(content);
}

const docsTimelinePath = path.join(new URL('../docs/functions', import.meta.url).pathname, 'createTimeline.md');
const content = fs.readFileSync(docsTimelinePath, 'utf-8');
const filteredTimelineDocs = filterCreateTimelineDocs(content);
if (filteredTimelineDocs) {
  // Adjust all markdown headings in filteredTimelineDocs so that the top levels start from ###
  const headingAdjustmentRegex = /^#+\s/gm;
  const headingLevelsInDocs = filteredTimelineDocs.match(headingAdjustmentRegex) || [];
  const minHeadingLevel = Math.min(...headingLevelsInDocs.map(h => h.trim().length));
  const adjustedFilteredTimelineDocs = filteredTimelineDocs.replace(headingAdjustmentRegex, (match) => {
    const adjustedLevel = match.trim().length - minHeadingLevel + 3; // Adjust to start from ###
    return '#'.repeat(adjustedLevel) + ' ';
  });

  fs.writeFileSync(docsTimelinePath, adjustedFilteredTimelineDocs);

  // Read the filtered content again
  const filteredContent = fs.readFileSync(docsTimelinePath, 'utf-8');
  const interfaceLinkRegex = /\.\.\/interfaces\/([\w-]+\.md)/g;
  let match;
  let appendedContent = '';

  // Find all links to files under ../docs/interfaces
  while ((match = interfaceLinkRegex.exec(filteredContent)) !== null) {
    const interfaceFilePath = path.join(new URL('../docs/interfaces', import.meta.url).pathname, match[1]);
    if (fs.existsSync(interfaceFilePath)) {
      let interfaceFileContent = fs.readFileSync(interfaceFilePath, 'utf-8');
      // Adjust all markdown headings in interfaceFileContent so that the top levels start from ####
      const headingLevelsInInterface = interfaceFileContent.match(headingAdjustmentRegex) || [];
      const minHeadingLevelInterface = Math.min(...headingLevelsInInterface.map(h => h.trim().length));
      interfaceFileContent = interfaceFileContent.replace(headingAdjustmentRegex, (match) => {
        const adjustedLevel = match.trim().length - minHeadingLevelInterface + 4; // Adjust to start from #### (changed from +3 to +4)
        return '#'.repeat(adjustedLevel) + ' ';
      });
      appendedContent += `\n\n---\n\n${interfaceFileContent}`;
    }
  }

  // Append the contents of the linked files to the end of docsTimelinePath
  if (appendedContent) {
    fs.appendFileSync(docsTimelinePath, appendedContent);
  }
}
// If filtered content returns nothing, keep the original content