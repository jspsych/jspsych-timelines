# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for jsPsych community experiment timelines. It provides a collection of reusable, configurable timeline implementations for psychological experiments. Each timeline package follows a uniform structure and can be loaded via CDN or NPM.

## Workspace Structure

- **Root**: Monorepo managed with npm workspaces
- **packages/**: Individual timeline packages (arrow-flanker, false-memory, go-nogo, spatial-cueing, etc.)
- **templates/cli/**: CLI tool for creating new timeline packages
- Each package exports:
  - `createTimeline(jsPsych, options)`: Main timeline creation method
  - `timelineUnits`: Optional smaller timeline building blocks
  - `utils`: Optional utility functions

## Common Commands

### Development
```bash
npm install                    # Install all workspace dependencies
npm test                       # Run all tests across packages
npm test -- --watch           # Run tests in watch mode
npm run build                 # Build all packages
npm run new                   # Create a new timeline package (interactive CLI)
```

### Testing
```bash
npm test                                              # Run all tests
npm test -- packages/arrow-flanker/src/index.spec.ts # Run single test file
npm test -- --watch                                  # Watch mode
```

### Build & Publishing
```bash
npm run build                  # Build all packages using tsup
npm run build -w @jspsych-timelines/arrow-flanker    # Build single package
```

### Changesets Workflow
```bash
npm run changeset              # Add a changeset for version tracking
npm run changeset:version      # Bump versions and update unpkg links + README
npm run changeset:publish      # Build and publish packages to npm
```

### Utility Commands
```bash
npm run update-unpkg-links     # Update unpkg CDN links in package READMEs
npm run update-readme          # Regenerate root README timeline table from package.json files
```

## Architecture

### Timeline Package Structure

Each timeline package follows this pattern:

```typescript
// packages/<timeline-name>/src/index.ts
import { JsPsych } from "jspsych";

// Main export: creates the full timeline
export function createTimeline(
  jsPsych: JsPsych,
  options?: ConfigObject
) {
  // Returns a jsPsych timeline object
}

// Optional: smaller timeline units
export const timelineUnits = {
  createPractice: (config?) => {...},
  createDebrief: (config?) => {...}
};

// Optional: utility functions
export const utils = {
  generateStimulus: (...) => {...}
};
```

### Build System

- **Build tool**: `tsup` (TypeScript bundler)
- **Output formats**: ESM (`.mjs`) and IIFE (`.global.js` for CDN)
- **Global namespace pattern**: `jsPsychTimeline<PascalCaseName>Task`
- Build configured in each `package.json`:
  ```json
  "scripts": {
    "build": "tsup src/index.ts --format esm,iife --sourcemap --dts --treeshake --clean --global-name jsPsychTimelineArrowFlankerTask"
  }
  ```

### Testing

- **Framework**: Jest with ts-jest
- **Config**: Centralized in `@jspsych/config/jest`
- Test files: `*.spec.ts` alongside source files
- All packages with tests referenced in root `package.json` jest config

### Version Management

- Uses **Changesets** for version management and publishing
- When making changes:
  1. Make code changes
  2. Run `npm run changeset` to document changes
  3. Changesets are committed with code
  4. On release: `npm run changeset:version` then `npm run changeset:publish`

### Automated Updates

Two gulp tasks maintain consistency:

1. **updateUnpkgLinks**: Updates CDN URLs in package READMEs when versions change
2. **updateReadme**: Regenerates the timeline table in root README.md from package.json metadata

## Creating a New Timeline

1. Run `npm run new` and follow prompts
2. This creates a new package in `packages/<name>` with:
   - TypeScript source structure
   - Example HTML files
   - Package.json with proper build config
   - README template
3. Run `npm i` to install dependencies
4. Develop in `packages/<name>/src/index.ts`
5. Test via `examples/index.html` in browser or write tests
6. Build with `npm run build -w @jspsych-timelines/<name>`

## Code Patterns

### Timeline Configuration

All timelines accept an optional configuration object with defaults:

```typescript
interface TimelineConfig {
  // Task parameters
  num_trials?: number;
  trial_duration?: number;
  // Feature flags
  show_instructions?: boolean;
  show_practice?: boolean;
  show_debrief?: boolean;
  // Stimuli
  stimulus?: string;
  stimuli?: string[];
  // Text overrides
  text_object?: typeof default_text;
}
```

### Data Tracking

Timeline trials should include consistent data fields:
```typescript
{
  data: {
    task: "timeline-name",
    phase: "practice" | "test" | "instructions" | "debrief"
  }
}
```

## Dependencies

- **jsPsych v8+**: Peer dependency for all timelines
- **jsPsych plugins**: Each timeline depends on specific plugins (e.g., `@jspsych/plugin-html-keyboard-response`)
- **Prettier**: Code formatting with 100 character line width
- **Husky + lint-staged**: Pre-commit hooks for formatting

## Important Notes

- Timeline packages are published to npm under `@jspsych-timelines/` scope
- All packages are public (`"access": "public"` in changesets config)
- CDN access via unpkg: `https://unpkg.com/@jspsych-timelines/<name>`
- Base branch for changesets is `main`
- When adding a new timeline, update root README via `npm run update-readme`
