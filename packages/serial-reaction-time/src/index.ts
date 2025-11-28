/**
 * Serial Reaction Time Task for jsPsych
 *
 * A comprehensive implementation of the Serial Reaction Time Task
 * based on Nissen & Bullemer (1987) and subsequent research.
 *
 * Supports extensive parameterization for research applications including:
 * - Multiple sequence structures (FOC, SOC, probabilistic, ASRT)
 * - Temporal manipulation (RSI, timing parameters)
 * - Dual-task conditions
 * - Awareness assessments
 * - Learning metrics calculation
 *
 * @module @jspsych-timelines/serial-reaction-time
 */

import { JsPsych } from 'jspsych';
import type { SerialReactionTimeConfig } from './types';
import { DEFAULT_CONFIG, STANDARD_SEQUENCES } from './constants';
import {
  mergeConfig,
  generateRandomSequence,
  generateASRTSequence,
  generateProbabilisticSequence,
  getNumLocations,
  targetToGridCoordinates,
  determineRandomBlockPositions,
  calculateLearningMetrics,
  calculateTripletFrequencies,
  getTriplet,
} from './utils';
import {
  createInstructionTrial,
  createBlockTransitionTrial,
  createSRTTrial,
  createRSITrial,
  createToneCountingTrial,
  createFreeRecallTrial,
  createRecognitionTrial,
  createResultsTrial,
  playTone,
} from './trials';
import { trial_text } from './text';

/**
 * Create a complete Serial Reaction Time Task timeline
 *
 * @param jsPsych - JsPsych instance
 * @param config - Configuration options (optional)
 * @returns Timeline object ready for jsPsych.run()
 *
 * @example
 * // Basic usage - Nissen & Bullemer replication
 * const timeline = createTimeline(jsPsych);
 *
 * @example
 * // SOC sequence with RSI = 250ms
 * const timeline = createTimeline(jsPsych, {
 *   sequence: {
 *     structure: 'SOC',
 *     sequence: [2, 3, 1, 2, 0, 1, 0, 3, 2, 1, 3, 0]
 *   },
 *   timing: {
 *     rsi: 250
 *   }
 * });
 *
 * @example
 * // Purely implicit learning (RSI = 0)
 * const timeline = createTimeline(jsPsych, {
 *   timing: {
 *     rsi: 0
 *   },
 *   learning_condition: 'implicit'
 * });
 *
 * @example
 * // ASRT variant
 * const timeline = createTimeline(jsPsych, {
 *   sequence: {
 *     structure: 'ASRT'
 *   },
 *   blocks: {
 *     num_training_blocks: 20,
 *     num_random_blocks: 0
 *   },
 *   metrics: {
 *     calculate_triplet_frequencies: true
 *   }
 * });
 */
export function createTimeline(
  jsPsych: JsPsych,
  config: SerialReactionTimeConfig = {}
): any {
  // Merge with defaults
  const fullConfig = mergeConfig(config, DEFAULT_CONFIG);

  // Merge text configuration
  const text = { ...trial_text, ...config.text_object };

  // Get grid configuration
  const grid = fullConfig.stimulus.grid!;
  const numLocations = getNumLocations(grid);

  // Generate or use provided sequence
  let baseSequence: number[];

  if (fullConfig.sequence.structure === 'ASRT') {
    // ASRT doesn't use a base sequence
    baseSequence = fullConfig.sequence.asrt_pattern!;
  } else if (fullConfig.sequence.sequence && fullConfig.sequence.sequence.length > 0) {
    // Use provided sequence
    baseSequence = fullConfig.sequence.sequence;
  } else {
    // Generate random sequence
    baseSequence = generateRandomSequence(
      jsPsych,
      fullConfig.sequence.length!,
      numLocations,
      fullConfig.sequence.allow_repeats!
    );
  }

  // Determine random block positions
  const totalBlocks =
    fullConfig.blocks.num_training_blocks! + fullConfig.blocks.num_random_blocks!;
  const randomBlockPositions = determineRandomBlockPositions(
    totalBlocks,
    fullConfig.blocks.num_random_blocks!,
    fullConfig.blocks.random_block_placement!,
    fullConfig.blocks.random_block_positions
  );

  // Main timeline
  const timeline: any[] = [];

  // Add instructions
  const instructionText =
    fullConfig.instructions ||
    (fullConfig.dual_task.enabled
      ? text.instructions_dual_task
      : fullConfig.learning_condition === 'explicit'
        ? text.instructions_explicit
        : text.instructions_implicit);

  timeline.push(createInstructionTrial(instructionText));

  // Initialize audio context for dual task if needed
  let audioContext: AudioContext | null = null;
  if (
    fullConfig.dual_task.enabled &&
    typeof window !== 'undefined' &&
    (window.AudioContext || (window as any).webkitAudioContext)
  ) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not available, dual-task tones will not play');
    }
  }

  // Create blocks
  for (let blockNum = 0; blockNum < totalBlocks; blockNum++) {
    const isRandomBlock = randomBlockPositions.includes(blockNum);
    const blockType = isRandomBlock ? 'random' : 'sequential';

    // Generate sequence for this block
    let blockSequence: number[];

    if (isRandomBlock) {
      // Random block
      blockSequence = generateRandomSequence(
        jsPsych,
        fullConfig.blocks.trials_per_block!,
        numLocations,
        fullConfig.sequence.allow_repeats!
      );
    } else {
      // Sequential block
      if (fullConfig.sequence.structure === 'ASRT') {
        blockSequence = generateASRTSequence(
          jsPsych,
          baseSequence,
          fullConfig.blocks.trials_per_block!,
          numLocations
        );
      } else if (fullConfig.sequence.structure === 'probabilistic') {
        blockSequence = generateProbabilisticSequence(
          jsPsych,
          baseSequence,
          fullConfig.blocks.trials_per_block!,
          numLocations,
          fullConfig.sequence.probability_ratio!
        );
      } else {
        // Deterministic, FOC, or SOC - repeat the base sequence
        blockSequence = [];
        for (let i = 0; i < fullConfig.blocks.trials_per_block!; i++) {
          blockSequence.push(baseSequence[i % baseSequence.length]);
        }
      }
    }

    // Create timeline variables for this block
    const timeline_variables = blockSequence.map((target, trialIndex) => {
      // Convert linear target to grid coordinates if using mouse
      const gridTarget =
        fullConfig.response.modality === 'mouse'
          ? targetToGridCoordinates(target, grid)
          : target;

      // Calculate triplet info for ASRT
      let tripletInfo = { triplet: 'N/A', frequency: 'high' as 'high' | 'low' };
      if (
        fullConfig.metrics.calculate_triplet_frequencies &&
        fullConfig.sequence.structure === 'ASRT'
      ) {
        tripletInfo = getTriplet(blockSequence, trialIndex, baseSequence);
      }

      return {
        target: gridTarget,
        block_number: blockNum,
        trial_number: trialIndex,
        block_type: blockType,
        sequence_position: isRandomBlock ? null : trialIndex % baseSequence.length,
        previous_target: trialIndex > 0 ? blockSequence[trialIndex - 1] : null,
        triplet: tripletInfo.triplet,
        triplet_frequency: tripletInfo.frequency,
      };
    });

    // Create block timeline
    const blockTimeline: any[] = [];

    // Dual task setup: schedule tone playback
    let toneSchedule: number[] = [];
    let highToneCount = 0;
    if (fullConfig.dual_task.enabled && audioContext) {
      // Randomly distribute tones throughout block
      const trialsPerTone = Math.floor(
        fullConfig.blocks.trials_per_block! / fullConfig.dual_task.tones_per_block!
      );
      for (let i = 0; i < fullConfig.dual_task.tones_per_block!; i++) {
        const toneTrialIndex = i * trialsPerTone + Math.floor(Math.random() * trialsPerTone);
        toneSchedule.push(toneTrialIndex);
        // Randomly assign high or low tone
        if (Math.random() < 0.5) {
          highToneCount++;
        }
      }
    }

    // Block trials
    const trialTimeline: any[] = [];

    // SRT trial
    const srtTrial = createSRTTrial(jsPsych, {
      grid,
      grid_square_size: fullConfig.stimulus.grid_square_size!,
      target_color: fullConfig.stimulus.target_color!,
      fade_duration: fullConfig.stimulus.fade_duration!,
      pre_target_duration: fullConfig.timing.pre_target_duration!,
      trial_duration: fullConfig.timing.trial_duration!,
      show_response_feedback: fullConfig.timing.show_response_feedback!,
      feedback_duration: fullConfig.timing.feedback_duration!,
      choices: fullConfig.response.choices,
      allow_nontarget_responses: fullConfig.response.allow_nontarget_responses,
      prompt: fullConfig.prompt,
      response_modality: fullConfig.response.modality!,
      data: {
        task: 'srt',
        phase: 'trial',
        block_type: () => jsPsych.timelineVariable('block_type'),
        block_number: () => jsPsych.timelineVariable('block_number'),
        trial_number: () => jsPsych.timelineVariable('trial_number'),
        sequence_position: () => jsPsych.timelineVariable('sequence_position'),
        previous_target: () => jsPsych.timelineVariable('previous_target'),
        triplet: () => jsPsych.timelineVariable('triplet'),
        triplet_frequency: () => jsPsych.timelineVariable('triplet_frequency'),
        ...fullConfig.data_labels,
      },
    });

    // Dual task: play tone on specific trials
    if (fullConfig.dual_task.enabled && audioContext) {
      srtTrial.on_start = (trial: any) => {
        const trialNum = jsPsych.timelineVariable('trial_number') as unknown as number;
        if (toneSchedule.includes(trialNum)) {
          const toneIndex = toneSchedule.indexOf(trialNum);
          const isHighTone = toneIndex < highToneCount;
          const frequency = isHighTone
            ? fullConfig.dual_task.tone_frequencies![1]
            : fullConfig.dual_task.tone_frequencies![0];

          setTimeout(() => {
            playTone(audioContext!, frequency, fullConfig.dual_task.tone_duration!);
          }, 100);
        }
      };
    }

    trialTimeline.push(srtTrial);

    // RSI delay
    const rsiTrial = createRSITrial(fullConfig.timing.rsi!);
    if (rsiTrial) {
      trialTimeline.push(rsiTrial);
    }

    blockTimeline.push({
      timeline: trialTimeline,
      timeline_variables,
    });

    // Add dual-task tone counting
    if (fullConfig.dual_task.enabled) {
      blockTimeline.push(createToneCountingTrial(text));
    }

    timeline.push({
      timeline: blockTimeline,
    });

    // Block transition (except after last block)
    if (blockNum < totalBlocks - 1) {
      timeline.push(
        createBlockTransitionTrial(text, blockNum + 1, totalBlocks, fullConfig.show_progress!)
      );
    }
  }

  // Awareness assessment
  if (fullConfig.awareness.enabled) {
    // Free recall
    if (fullConfig.awareness.assessment_types!.includes('free-recall')) {
      timeline.push(createFreeRecallTrial(text));
    }

    // Recognition test
    if (fullConfig.awareness.assessment_types!.includes('recognition')) {
      const recognitionTimeline: any[] = [];

      // Create old fragments from the base sequence
      const oldFragments: number[][] = [];
      for (
        let i = 0;
        i <
        Math.min(
          fullConfig.awareness.recognition_fragments! / 2,
          baseSequence.length - fullConfig.awareness.recognition_fragment_length! + 1
        );
        i++
      ) {
        oldFragments.push(
          baseSequence.slice(i, i + fullConfig.awareness.recognition_fragment_length!)
        );
      }

      // Create new fragments (random)
      const newFragments: number[][] = [];
      for (let i = 0; i < fullConfig.awareness.recognition_fragments! / 2; i++) {
        newFragments.push(
          generateRandomSequence(
            jsPsych,
            fullConfig.awareness.recognition_fragment_length!,
            numLocations,
            false
          )
        );
      }

      // Combine and shuffle
      const allFragments = [
        ...oldFragments.map((f) => ({ fragment: f, isOld: true })),
        ...newFragments.map((f) => ({ fragment: f, isOld: false })),
      ];
      jsPsych.randomization.shuffle(allFragments);

      recognitionTimeline.push(
        createInstructionTrial(text.recognition_instructions)
      );

      allFragments.forEach((item) => {
        recognitionTimeline.push(
          createRecognitionTrial(jsPsych, item.fragment, item.isOld)
        );
      });

      timeline.push({
        timeline: recognitionTimeline,
      });
    }
  }

  // Calculate and display results
  const resultsNode = {
    timeline: [
      {
        type: 'jsPsychHtmlKeyboardResponse',
        stimulus: '',
        trial_duration: 0,
        on_start: () => {
          // Calculate learning metrics
          const metrics = calculateLearningMetrics(jsPsych);
          jsPsych.data.addProperties({
            mean_rt_sequential: metrics.mean_rt_sequential,
            mean_rt_random: metrics.mean_rt_random,
            rt_difference: metrics.rt_difference,
            mean_accuracy_sequential: metrics.mean_accuracy_sequential,
            mean_accuracy_random: metrics.mean_accuracy_random,
          });

          // Calculate triplet frequencies for ASRT
          if (fullConfig.metrics.calculate_triplet_frequencies) {
            const tripletMetrics = calculateTripletFrequencies(jsPsych);
            jsPsych.data.addProperties({
              high_freq_rt: tripletMetrics.high_freq_rt,
              low_freq_rt: tripletMetrics.low_freq_rt,
              triplet_learning_index: tripletMetrics.learning_index,
            });
          }
        },
      },
      createResultsTrial(text, undefined),
    ],
  };

  timeline.push(resultsNode);

  return {
    timeline,
  };
}

/**
 * Exported utilities for advanced customization
 */
export const utils = {
  generateRandomSequence,
  generateASRTSequence,
  generateProbabilisticSequence,
  calculateLearningMetrics,
  calculateTripletFrequencies,
};

/**
 * Exported constants for easy access to standard sequences
 */
export { STANDARD_SEQUENCES, PRESETS, RSI_VALUES, PROBABILITY_RATIOS } from './constants';

// Re-export types for TypeScript users
export type { SerialReactionTimeConfig, SRTTrialData, SRTSummaryData } from './types';
