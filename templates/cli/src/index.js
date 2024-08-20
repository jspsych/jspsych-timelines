import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { input, select } from "@inquirer/prompts";
import { deleteSync } from "del";
import { dest, series, src } from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import slash from "slash";

const repoRoot = slash(path.resolve(fileURLToPath(import.meta.url), "../../../.."));

function formatName(input) {
  return input
    .trim()
    .replace(/[\s_]+/g, "-") // Replace all spaces and underscores with hyphens
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Replace camelCase with hyphens
    .replace(/[^\w-]/g, "") // Remove all non-word characters
    .toLowerCase();
}

async function runPrompts() {
  const language = await select({
    message: "What language do you want to use?",
    choices: [
      {
        name: "TypeScript",
        value: "ts",
      },
      {
        name: "JavaScript",
        value: "js",
      }
    ],
    loop: false,
  });

  const name = await input({
    message: "What do you want to call this timeline package?",
    required: true,
    transformer: (input) => {
      return formatName(input);
    },
    validate: (input) => {
      const fullDestPath = `${repoRoot}/packages/${formatName(input)}`;
      if (fs.existsSync(fullDestPath)) {
        return "A timeline package with this name already exists. Please choose a different name.";
      } else {
        return true;
      }
    },
  });

  const description = await input({
    message: "Enter a brief description of the timeline",
    required: true,
  });

  const author = await input({
    message: "Who is the author of this timeline?",
    required: true,
  });

  const authorUrl = await input({
    message: `Enter a profile URL for the author, e.g. a link to a GitHub profile [Optional]:`,
  });

  return {
    language: language,
    name: name,
    description: description,
    author: author,
    authorUrl: authorUrl,
  };
}

async function processAnswers(answers) {
  answers.name = formatName(answers.name);

  const camelCaseName =
    answers.name.charAt(0).toUpperCase() +
    answers.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  const globalName = "jsPsychTimeline" + camelCaseName;

  function processTemplate() {
    return src(`${repoRoot}/templates/template-${answers.language}/**/*`)
      .pipe(replace("{name}", answers.name))
      .pipe(replace("{full name}", answers.name))
      .pipe(replace("{author}", answers.author))
      .pipe(replace("{authorUrl}", answers.authorUrl))
      .pipe(
        replace(
          "{documentation-url}",
          `https://github.com/jspsych/jspsych-timelines/packages/${answers.name}/README.md`
        )
      )
      .pipe(replace("{description}", answers.description))
      .pipe(replace("{globalName}", globalName))
      .pipe(replace("_globalName_", globalName))
      .pipe(replace("{camelCaseName}", camelCaseName))
      .pipe(dest(`${repoRoot}/packages/${answers.name}`));
  }

  function renameDocsTemplate() {
    return src(`${repoRoot}/packages/${answers.name}/docs/docs-template.md`)
      .pipe(rename(`${answers.name}.md`))
      .pipe(dest(`${repoRoot}/packages/${answers.name}/docs`))
      .on("end", function () {
        deleteSync(`${repoRoot}/packages/${answers.name}/docs/docs-template.md`);
      });
  }

  function renameExampleAltLoadComment() { // Rename unpkg load comment url in the example script
    return src(`${repoRoot}/packages/${answers.name}/examples/index.html`)
      .pipe(replace("{name}", answers.name))
      .pipe(dest(`${repoRoot}/packages/${answers.name}/examples`));
  }
  series(processTemplate, renameDocsTemplate, renameExampleAltLoadComment)();
}

const answers = await runPrompts();
await processAnswers(answers);
