import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get the package root directory
const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const docsDir = path.join(projectRoot, 'docs');

console.log("Generating API documentation...");
execSync(`npx typedoc --options typedoc.json --out ${docsDir} --plugin typedoc-plugin-markdown`);

console.log(`API documentation generated in ${docsDir}`);
