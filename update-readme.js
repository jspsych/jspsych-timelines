/**
 * This script updates the root README.md file with the list of all packages when a new one is
 * published, or when the description/author of an existing package is updated.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

import { dest, series, src } from "gulp";
import replace from "gulp-replace";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagesDir = path.join(__dirname, "packages");
const readmePath = path.join(__dirname, "README.md");

function getPackageInfo(packageDir) {
  const packageJsonPath = path.join(packageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) return null;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return {
    name: packageJson.name,
    description: packageJson.description,
    author: packageJson.author.name,
    authorUrl: packageJson.author.url,
  };
}

async function updateReadme() {
  const packageInfos = fs
    .readdirSync(packagesDir)
    .map((dir) => path.join(packagesDir, dir))
    .filter((dir) => fs.lstatSync(dir).isDirectory())
    .map(getPackageInfo)
    .filter((info) => info !== null);

  const timelineListHead = `### Timelines\nTimeline | Contributor | Description\n----------- | ----------- | -----------\n`;

  const guidelinesHead = "## Using timelines from this repository";

  let timelineList = "";

  packageInfos.map((info) => {
    const packageName = info.name.replace(/^\@jspsych-timelines\//g, "");
    const packageReadmeLink = `https://github.com/jspsych/jspsych-timelines/blob/main/packages/${packageName}/README.md`;
    const authorRender = info.authorUrl ? `[${info.author}](${info.authorUrl})` : info.author;
    timelineList = timelineList.concat(
      `[${packageName}](${packageReadmeLink}) | ${authorRender} | ${
        info.description ? info.description : `_Description for ${packageName}._`
      } \n`
    );
  });

  const timelineTable = [timelineListHead, timelineList, "\n", guidelinesHead];

  function generateTimelineTable() {
    return src(`${__dirname}/README.md`)
      .pipe(
        replace(
          /### Timelines[\s\S]*?## Using timelines from this repository/g,
          timelineTable.join("")
        )
      )
      .pipe(dest(__dirname));
  }

  series(generateTimelineTable)();
}

export default updateReadme;
