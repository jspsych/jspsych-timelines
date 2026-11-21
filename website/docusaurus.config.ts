import type {Config} from '@docusaurus/types';
import {defineJspsychConfig} from '@jspsych/docusaurus-preset';

// baseUrl comes from the environment so PR previews can be built under
// /pr-preview/pr-<N>/ (see .github/workflows/website-preview.yml). Production is the
// root of timelines.jspsych.org.
const baseUrl = process.env.DOCUSAURUS_BASE_URL || '/';
const editUrl = 'https://github.com/jspsych/jspsych-timelines/tree/main/website/';

const config: Config = defineJspsychConfig({
  title: 'jsPsych Timelines',
  tagline: 'Reusable, documented behavioral tasks for jsPsych',
  url: 'https://timelines.jspsych.org',
  baseUrl,
  organizationName: 'jspsych',
  projectName: 'jspsych-timelines',
  githubUrl: 'https://github.com/jspsych/jspsych-timelines',
  favicon: 'img/favicon.svg',

  docs: {
    sidebarPath: './sidebars.ts',
    routeBasePath: '/',
    editUrl,
  },

  navbar: {
    title: 'jsPsych Timelines',
    items: [
      {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
      {to: '/reference/flanker', label: 'Tasks', position: 'left'},
    ],
  },

  // The demos load jsPsych from unpkg. The theme's default (8.2.2) predates
  // jsPsych.adaptive, which stop-signal-task needs (8.4.0+); keep this in step
  // with the jspsych version the packages are built and tested against.
  jspsych: {
    timelineExample: {jspsychVersion: '8.4.0'},
  },

  footerLinks: [
    {
      title: 'Docs',
      items: [
        {label: 'Overview', to: '/'},
        {label: 'Options vocabulary', to: '/vocabulary'},
      ],
    },
  ],
});

export default config;
