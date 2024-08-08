# jspsych-timelines

This is an open repository of timelines for jsPsych. The goal of this repository is to provide a place for researchers to share their jsPsych tasks with the community. Packages in this repository all implement a [uniform structure](#structure) that makes it easy to use them in your own experiments and combine them with other code.

## Using tasks from this repository

The modules in this repository can be loaded via a CDN or via NPM. The CDN is the easiest way to get started. For example, to load the [arrow-flanker]() task from the CDN, you would add the following script tag to your HTML document:

```html
<script src="https://unpkg.com/@jspsych-timelines/arrow-flanker"></script>
```

This will load the task into the global namespace as `jsPsychTimelineArrowFlanker`. You can then use the task in your experiment like this:

```js
const jsPsych = initJsPsych();
const task = jsPsychTimelineArrowFlanker.createTimeline(jsPsych, {options});
jsPsych.run([task]);
```

In the above example, `task` is a jsPsych timeline object that can be added to other timelines or used as the main timeline. The `options` parameter is an object that contains options for the task. The options are described in the documentation for each task.

## Structure

Each timeline module exports a `createTimeline()` method. This method returns an object with a `timeline` property that can be inserted into a jsPsych timeline.

```js
const task = jsPsychTimelineModule.createTimeline(jsPsych, {options})
jsPsych.run([task])
```

Timeline modules may also export a `timelineUnits` objects and a `utils` object. 

The `timelineUnits` object contains functions that create smaller units of a timeline than the main `createTimeline()` method. For example, if the main timeline contains two phases (e.g., memorization and test) then there could be `timelineUnits.createTestTimeline()` and `timelineUnits.createMemorizationTimeline()`. These functions could then be used for assembling the overall task in a different way than `createTimeline()` allows. There are no constraints on what kinds of timeline creation methods can be exported in `timelineUnits`, other than the requirement that all methods return an object that can be added to a jsPsych timeline. Some modules may export methods to create units as small as a single trial, while others export no methods at all.

The `utils` object contains miscellaneous functions that may be useful when using the module. For example, if a task requires creating a complex stimulus that can be procedurally generated there could be a `utils.createStimulus()` method that returns HTML. Or if there is a task that involves a particular scoring system like a questionnaire with validated indicies then there could be a `utils.generateScore()` method. There are no constraints on what methods can be exported as part of the `utils` object.

## Contributing new tasks

If you would like to contribute a new task to this repository, please follow these steps:

1. Fork this repository
2. Create a new branch for your task (e.g., 'new-task-arrow-flanker')
3. Run `npm install` in the root directory of the repository to install dependencies.
4. Run `npm run new` and answer the prompts to create a new task template in the `packages` directory.
5. Edit the files in the new task directory to implement your task. `src/index.ts` is the main file that will be loaded when the task is used. `README.md` is the documentation for the task. `examples/index.html` is a basic jsPsych experiment template that you can modify to illustrate how your task works.
6. Run `npm run build` to build the task. This will create a `dist` directory with the compiled task.
7. Verify that the example works by opening `examples/index.html` in your browser.
8. Add a changeset by running `npm run changeset` in the main directory of the repository. This will prompt you for a description of the changes you made. This will create a new changeset file in the `changesets` directory.
8. Open a pull request to merge your branch into the `main` branch of this repository.

We welcome tasks of all kinds! 

### What if my task requires a custom plugin?

If your task requires a custom plugin, we'd recommend adding the plugin to [jspsych-contrib](https://github.com/jspsych/jspsych-contrib) before submitting the task here. This will make it easier for other researchers to use your plugin in their own experiments. Currently, this repository is aimed at tasks that use plugins that are published on `npm`. 