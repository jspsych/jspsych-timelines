---
"@jspsych-timelines/arrow-flanker": major
---

**Major refactor to use published @jspsych-contrib/plugin-flanker package**

This release represents a comprehensive refactor of the arrow-flanker timeline to leverage the newly published `@jspsych-contrib/plugin-flanker` package, enabling more flexible stimulus types and improved performance.

### Breaking Changes

- Now requires `@jspsych-contrib/plugin-flanker@^1.0.0` as a peer dependency
- Timeline implementation completely refactored to use the plugin-flanker instead of custom trial logic
- Internal architecture changes may affect advanced users who were directly importing internal utilities

### New Features

- **Text Configuration System**: All user-facing text is now configurable via the `text_object` parameter to facilitate translation and customization
- **Improved Sequential Effects Tracking**: Now uses `jsPsych.data.get()` for more reliable tracking of previous trial data
- **Cleaner API**: Utilities are now namespaced under `.utils` export following jspsych-timelines conventions

### Improvements

- SOA handling refactored with cleaner `has_soa` flag pattern instead of try/catch
- Only user-facing utilities are exported; internal implementation details are no longer part of the public API
- Better separation of concerns between plugin (stimulus presentation) and timeline (trial ordering, blocks, configuration)

### Migration Guide

For most users, this update should be backward compatible. However, if you were:
- Importing internal utilities: These are no longer exported. Use the public API via `utils.*`
- Relying on specific trial implementation details: The underlying plugin has changed, though the timeline API remains the same

Install the peer dependency:
```bash
npm install @jspsych-contrib/plugin-flanker
```
