import inquirer from 'inquirer';
import gulp from 'gulp';
import rename from 'gulp-rename';
import replace from 'gulp-replace';

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'What do you want to call this timeline package?',
    filter: (input) => {
      // convert to hyphen case
      return input
        .trim()
        .replace(/[\s_]+/g, '-') // Replace all spaces and underscores with hyphens
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Replace camelCase with hyphens
        .replace(/[^\w-]/g, '') // Remove all non-word characters
        .toLowerCase();
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Enter a brief description of the timeline'
  },
  {
    type: 'input',
    name: 'author',
    message: 'Who is the author of this timeline?'
  }
]).then(answers => {

  const globalName = "jsPsychTimeline" + answers.name.charAt(0).toUpperCase() + answers.name.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());

  gulp.src('templates/template-ts/**/*')
    .pipe(rename((path) => {
      path.dirname = path.dirname.replace('template-ts', answers.name);
    }))
    .pipe(gulp.dest(`packages/${answers.name}`))
    .on('end', () => {
      gulp.src(`packages/${answers.name}/package.json`)
        .pipe(replace('{name}', answers.name))
        .pipe(replace('{description}', answers.description))
        .pipe(replace('{author}', answers.author))
        .pipe(replace('{globalName}', globalName))
        .pipe(gulp.dest(`packages/${answers.name}`));

      gulp.src(`packages/${answers.name}/README.md`)
        .pipe(replace('{name}', answers.name))
        .pipe(replace('{description}', answers.description))
        .pipe(replace('{author}', answers.author))
        .pipe(replace('{globalName}', globalName))
        .pipe(gulp.dest(`packages/${answers.name}`));

      gulp.src(`packages/${answers.name}/examples/index.html`)
        .pipe(replace('{globalName}', globalName))
        .pipe(gulp.dest(`packages/${answers.name}/examples/`));
    });
});