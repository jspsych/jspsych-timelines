# jspsych-timelines: jsPsych community experiment timelines

This is an open repository of [jsPsych experiment timelines](https://www.jspsych.org/v8/overview/timeline/). The goal of this repository is to provide a place for researchers to share their timelines with the community. Packages in this repository all implement a [uniform structure](#structure) that makes it easy to use them in your own experiments and combine them with other code.

If instead of an experiment timeline, you wish to share a [plugin](https://www.jspsych.org/latest/overview/plugins/) or [extension](https://www.jspsych.org/v8/overview/extensions/), you should check out the [jspsych-contrib](https://github.com/jspsych/jspsych-contrib) repository! 

## List of available timelines

The jsPsych timelines that have been contributed by community members can be found in the `/packages` directory. Here is a list overview of them:

### Timelines
Timeline | Contributor | Description
----------- | ----------- | -----------
[arrow-flanker](https://github.com/jspsych/jspsych-timelines/blob/main/packages/arrow-flanker/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | Arrow flanker task for jsPsych 
[false-memory](https://github.com/jspsych/jspsych-timelines/blob/main/packages/false-memory/README.md) | [Cherrie Chang](https://github.com/cherriechang) | False memory task for jsPsych 
[go-nogo](https://github.com/jspsych/jspsych-timelines/blob/main/packages/go-nogo/README.md) | [URSI 2025 Team](https://example.com) | A complete Go/No-Go task implementation for jsPsych measuring response inhibition and sustained attention. Includes interactive practice, configurable parameters, and comprehensive data collection. 
[spatial-cueing](https://github.com/jspsych/jspsych-timelines/blob/main/packages/spatial-cueing/README.md) | [Cherrie Chang](https://github.com/cherriechang) | A shareable timeline of the Posner spatial cueing task. 
[spatial-nback](https://github.com/jspsych/jspsych-timelines/blob/main/packages/spatial-nback/README.md) | [A. Hunter Farhat](https://github.com/farhat60) | A deployable spatial grid n-back timeline for jsPsych. Supports custom grid sizes, n-back levels, feedback, and more. 

## Using timelines from this repository

The modules in this repository can be loaded via a CDN or via NPM. The CDN is the easiest way to get started. For example, to load the [arrow-flanker](https://github.com/jspsych/jspsych-timelines/blob/main/packages/arrow-flanker) timeline from the CDN, you would add the following script tag to your HTML document:

```html
<script src="https://unpkg.com/@jspsych-timelines/arrow-flanker"></script>
```

> ⚠️ You will also need to import the jsPsych library and css CDNs, in addition to the timeline CDN:
```html
<head>
  <script src="https://unpkg.com/jspsych"></script>
  <script src="https://unpkg.com/@jspsych-timelines/arrow-flanker"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych/css/jspsych.css">
</head>
```

This will load the timeline into the global namespace as `jsPsychTimelineArrowFlankerTask`. You can then use the timeline in your experiment like this:

```html
<script>
  const jsPsych = initJsPsych();
  const options = { fixation_duration: 400 };
  const timeline = jsPsychTimelineArrowFlankerTask.createTimeline(jsPsych, options);
  jsPsych.run([timeline]);
</script>
```

In the above example, `timeline` is a jsPsych timeline object that can be added to other timelines or used as the main timeline. The `options` parameter is an object that contains jsPsych timeline properties (in this case, `fixation_duration: 400`) to configure jsPsych properties present in the imported timeline. The configurable options are described in the documentation for each timeline.

## Structure

Notice that each timeline module exports a `createTimeline()` method. This method returns an object with a `timeline` property that can be inserted into a jsPsych timeline and can be run without the optional `options` parameter to keep default timeline property settings.

```js
const timeline = jsPsychTimelineModule.createTimeline(jsPsych, { options });
jsPsych.run([timeline]);
```

Timeline modules may also export a `timelineUnits` objects and a `utils` object. 

The `timelineUnits` object contains functions that create smaller units of a timeline than the main `createTimeline()` method. For example, if the main timeline contains two phases (e.g., memorization and test) then there could be `timelineUnits.createTestTimeline()` and `timelineUnits.createMemorizationTimeline()`. These functions could then be used for assembling the overall timeline in a different way than `createTimeline()` allows. There are no constraints on what kinds of timeline creation methods can be exported in `timelineUnits`, other than the requirement that all methods return an object that can be added to a jsPsych timeline. Some modules may export methods to create units as small as a single trial, while others export no methods at all.

The `utils` object contains miscellaneous functions that may be useful when using the module. For example, if a timeline requires creating a complex stimulus that can be procedurally generated there could be a `utils.createStimulus()` method that returns HTML. Or if there is a timeline that involves a particular scoring system like a questionnaire with validated indicies then there could be a `utils.generateScore()` method. There are no constraints on what methods can be exported as part of the `utils` object.

## Guidelines for contributing new timelines

### Contribution requirements
Contributions to this repository must:

* Work as described
* Include the complete code for the timeline.
* Include a `README.md` file following our [template](https://github.com/jspsych/jspsych-dev/blob/main/packages/new-timeline/templates/timeline-template-ts/README.md).
* Include a `package.json` file.

Optionally, contributions can include:

* A `/docs` directory with documentation matching the template for docs on jspsych.org 
* An `/examples` directory with a working `.html` demo.
* A test suite following the testing framework in our `-ts` templates.

### To contribute to this repository, follow these steps:
1. Clone this repository on your machine and run `npm i` to install its packages.
2. Run `npx @jspsych/new-timeline` and answer the prompts to create a new timeline template under `/packages`. This is a command-line tool we built to make setting up the development of a new timeline easier. Documentation for using this tool can be found in the [`jspsych-dev` repository](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-timeline#readme).
3. Run `npm i` in your root directory to install all your dependencies.
4. After you are done editing the timeline template, verify that it works by opening `examples/index.html` in your browser.
5. Add a changeset by running `npm run changeset` in the main directory of the repository. This will prompt you for a description of the changes you made and creates a new changeset file in the `changesets` directory accordingly.
6. Open a pull request to merge your branch into the `main` branch of this repository.

In the pull request comments, please make it clear how we can verify that the timeline is functional. 
This could be accomplished with a link to a demonstration experiment, the inclusion of an example file and/or testing files, or through some other means.
We try to review pull requests quickly and add new timelines as soon as the minimal standards are met.

## Creating a new timeline

We have a tool called [`new-timeline`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-timeline) for building new timelines at [jspsych-dev](https://github.com/jspsych/jspsych-dev/tree/main). Instructions for using the new-timeline tool can be found at the [`README.md`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-timeline/README.md) in this directory.

## jsPsych version compatibility
To ensure your timeline can be run by others using the latest version of jsPsych, we encourage you to make your timeline compatible with jsPsych v7+. Documentation for how to migrate from v6.x to v7.x can be found [here](https://www.jspsych.org/v7/support/migration-v7/), and from v.7x to v8.x [here](https://www.jspsych.org/v8/support/migration-v8/).

## What if my timeline requires a custom plugin?

If your timeline requires a custom plugin, we'd recommend adding the plugin to [jspsych-contrib](https://github.com/jspsych/jspsych-contrib) before submitting the timeline here. This will make it easier for other researchers to use your plugin in their own experiments. Currently, this repository is aimed at timelines that use plugins that are published on `npm`. Make sure the plugin and your timeline are both compatible with jsPsych v7+ so that they can work with each other and with the latest jsPsych version.