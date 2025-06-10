import fs from 'fs';
import path from 'path';
import { rmSync } from 'fs';

// Define paths
const baseDir = new URL('..', import.meta.url).pathname;
const docsDir = path.join(baseDir, 'docs');
const readmePath = path.join(baseDir, 'README.md');

// Update placeholders for createTimeline, timelineUnits, and utils
function updatePlaceholder(fpFromDocs, placeholder) {
  const fp = path.join(docsDir, fpFromDocs);
  console.log(fp)
  try {
    // Read files
    const fpContent = fs.readFileSync(fp, 'utf8');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Replace placeholder with content
    const updatedReadmeContent = readmeContent.replace(
      placeholder,
      fpContent
    );
    
    // Write updated README
    fs.writeFileSync(readmePath, updatedReadmeContent);
    console.log(`Successfully updated ${placeholder} in README.md`);
  } catch (error) {
    console.error('Error updating createTimeline description:', error);
  }
}

// Function to delete the docs folder
function deleteDocs() {
  const docsDirectory = path.join(baseDir, '.', 'docs');
  console.log("docsDirectory: ", docsDirectory)
  try {
    rmSync(docsDirectory, { recursive: true, force: true });
    console.log('Successfully deleted docs folder');
  } catch (error) {
    console.error('Error deleting docs folder:', error);
  }
}

// Main function
function updateReadmePlaceholders() {
  updatePlaceholder('functions/createTimeline.md', '<!-- createTimeline documentation -->');
  updatePlaceholder('variables/timelineUnits.md', '<!-- timelineUnits documentation -->');
  updatePlaceholder('variables/utils.md', '<!-- utils documentation -->');
  
  deleteDocs();
}

// Run the updates
updateReadmePlaceholders();
