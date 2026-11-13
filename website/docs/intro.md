---
title: jsPsych Timelines
slug: /
sidebar_label: Overview
---

# jsPsych Timelines

jsPsych Timelines is a collection of ready-to-run behavioral tasks for [jsPsych](https://www.jspsych.org). Each task is an npm package that exports a `createTimeline(jsPsych, options)` function, a set of timeline units for building variants, and scoring utilities.

This site is the reference for those packages. Each task page has:

- the options table, generated from the package's TypeScript types;
- a **Try it** panel that builds an options form from the same schema and runs the task in the page, built from the code in this repository;
- the data the task writes and how it is scored.

## Tasks

- [Flanker](/reference/flanker)

More tasks will appear here as their pages are written. The package conventions are in [`PACKAGE-STANDARD.md`](https://github.com/jspsych/jspsych-timelines/blob/main/PACKAGE-STANDARD.md). Option names follow a [shared vocabulary](/vocabulary).
