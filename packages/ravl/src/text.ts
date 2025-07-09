export const englishText = {
    welcome_title: 'Rey Auditory Verbal Learning Test (RAVLT)',
    welcome_text: `
        <p>In this test, you will hear a list of words and be asked to remember them.</p>
        <p>There will be three trials where you hear the same list of words.</p>
        <p>After each trial, you will be asked to recall as many words as you can remember.</p>
        <p>Later, there will be a delayed recall test.</p>
    `,
    welcome_start_button: 'Start',
    trial: 'Trial',
    instruction_text_trial1: `
        <p>You will hear a list of words. Listen carefully and try to remember them.</p>
        <p>After you hear all the words, you will be asked to say as many as you can remember.</p>
        <p>Don't worry if you don't remember them in the right order.</p>    
    `,
    instruction_text: `
        <p>Let's do that again. After you hear the words, say as many as you can remember, even if you said them in the previous trial.</p>
    `,
    interference_instruction_text: `
        <p>Now I'm going to read you a different list of words. Listen carefully and try to remember them.</p>
        <p>After you hear all the words, tell me as many as you can remember from this new list.</p>
    `,
    trial_a6_instruction_text: `
        <p>Now I want you to tell me all the words you can remember from the very first list - the original list we practiced several times.</p>
        <p>Don't include words from the list you just heard, only from the original first list.</p>
    `,
    listen_carefully: 'Listen carefully to the words...',
    ready: 'Ready',
    continue: 'Continue',
    create_word_presentation_text: 'The words will be presented automatically. Select below to continue',
    recall: 'Recall',
    submit: 'Submit',
    recall_instructions: `
          <p>Click on all the words you can remember from the list.</p>
          <p>You can click words to select/unselect them. Click submit below when done.</p>
    `,
    selected_words: 'Selected words',
    break_time: 'Break Time',
    interim_text: `
        <p>Great job! Now we're going to take a break.</p>
        <p>In a real testing situation, you would now complete other tasks</p>
        <p>that don't involve memory (like Visual Reasoning) for 5-25 minute(s).</p>
        <p>For this demo, we'll proceed directly to the delayed recall.</p>
        <p>Click below when you are ready.</p>
    `,
    delayed_recall: 'Delayed Recall',
    delayed_recall_instructions_text: `
        <p>A while ago, you heard a list of words several times, and you had to repeat back the words.</p>
        <p>Tell me all the words you can remember from that original list.</p>
        <p>Select below when you are ready.</p>
    `,
    delayed_recall_text: `
        <p>Click on all the words you can remember from the original word list.</p>
        <p>You can click words to select/unselect them. Click Submit when done.</p>
    `,
    interference_trial: 'Interference Trial',
    list_b: 'List B',
    trial_a6: 'Trial A6',
    original_list_recall: 'Original List Recall',
    recognition_trial: 'Recognition Trial', 
    recognition_instructions: `
        <p>Now you will see a list of words. Some of these words were from the original word list you learned.</p>
        <p>Click on only the words that were from the very first list (the original 15 words).</p>
        <p>Do not select words from the interference list or any other words.</p>
    `,
    finish: 'Finish',
    original_word_list: 'Original Word List',
    select_below: 'Select below to finish',
    words_recalled: 'Words Recalled',
    correct: 'Correct',
    RAVLT_results_summary: 'RAVLT Results Summary',
    trial_warning: 'RAVLT learning trials have not been completed. You must complete all learning trials before beginning the delayed recall phase.',
    too_soon_warning: 'You are attempting to begin RAVLT Delay too soon. Only {minutes} minute(s) have passed since completing the learning trials. The minimum recommended delay is {minDelay} minute(s).',
    too_late_warning: 'You are attempting to begin RAVLT Delay too late. {minutes} minute(s) have passed since completing the learning trials. The maximum recommended delay is {maxDelay} minute(s).',
    minutes: 'minutes',
    maximum_time: 'Maximum time: {seconds} seconds',
    recall_type_instructions: 'Type the words you remember, separated by commas:',
    delay_period: 'Delay period: {minutes} minute(s)',
    delay_period_header: 'Delay Period',
    minimum_delay_text: 'Minimum delay: {minDelay} minute(s) | Recommended delay: {recommendedDelay} minute(s)',
    delay_waiting_instructions: 'You may proceed at any time, but warnings will appear if under {minDelay} minute(s).',
    delay_instructions: {
        minimum_delay: 'Minimum recommended delay: {minDelay} minute(s)',
        optimal_delay: 'Optimal delay: {optimalDelay} minute(s)', 
        maximum_delay: 'Maximum recommended delay: {maxDelay} minute(s)',
        use_time: 'Use this time for non-memory related activities',
        timing_warning: 'You can proceed at any time - warnings will appear if timing is not optimal',
        proceed_anytime: 'You can proceed at any time - timing validation will occur next'
    },
    delay_minimum_remaining: 'Minimum delay: {remaining} remaining',
    delay_warning_proceed: 'You may proceed now, but a timing warning will appear if under {minDelay} minute(s).',
    waiting_instructions: 'You may engage in non-memory related activities during this time.',
    none: 'None',
    assessment_notes: 'Assessment Notes:',
    assessment_terminated: 'Assessment Terminated',
    end_assessment_btn: 'End Assessment',
    early_termination_text: `
        <p>The assessment has been stopped due to timing validation concerns.</p>
        <p>Please review the assessment notes and consider rescheduling the delayed recall portion when appropriate timing can be maintained.</p>
    `,
    outside_timing: 'Delayed recall started outside recommended timing: {minutes} minute(s) after learning trials (recommended: {minDelay}-{maxDelay} minute(s))',
    within_timing: 'Delayed recall started within recommended timing: {minutes} minute(s) after learning trials',
    
    // Additional UI text
    continue_to_delayed_recall: 'Continue to Delayed Recall',
    delay_period_in_progress: 'Delay Period in Progress',
    elapsed_time: '{minutes}:{seconds} elapsed',
    initial_elapsed_time: '0:00 elapsed',
    instructions_heading: 'Instructions:',
    proceed_to_delayed_recall: 'Proceed to Delayed Recall',
    
    // Status messages
    minimum_delay_completed: '✓ Minimum delay completed!',
    optimal_timing_achieved: 'Optimal timing achieved. You may proceed when ready.',
    
    // Timing validation
    timing_validation_passed: '✓ Timing Validation Passed',
    ready_to_begin_delayed_recall: 'Ready to begin delayed recall phase.',
    time_since_learning_trials: 'Time since learning trials: {minutes} minute(s)',
    timing_validation_warning: '⚠️ Timing Validation Warning',
    warning_label: 'Warning:',
    recommended_delay_range: 'Recommended delay range: {minDelay} - {maxDelay} minute(s)',
    deviations_note: 'Any deviations from standard testing procedure should be recorded in the assessment notes.',
    continue_anyway_question: 'Do you want to continue anyway?',
    
    // Button text
    continue_btn: 'Continue',
    continue_anyway_btn: 'Continue Anyway',
    stop_assessment_btn: 'Stop Assessment',
    
    // Assessment notes
    assessment_stopped_timing: 'Assessment stopped due to timing validation failure'
}

// Helper function to substitute variables in text templates
export function substituteText(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

  // Standard RAVLT word lists
export const WORD_LIST = [
    'drum', 'curtain', 'bell', 'coffee', 'school',
    'parent', 'moon', 'garden', 'hat', 'farmer',
    'nose', 'turkey', 'color', 'house', 'river'
  ];

// RAVLT List B (interference list)
export const WORD_LIST_B = [
  'desk', 'ranger', 'bird', 'shoe', 'stove',
  'mountain', 'glasses', 'towel', 'cloud', 'boat',
  'lamb', 'gun', 'pencil', 'church', 'fish'
];

// Recognition trial words (List A + distractors)
export const RECOGNITION_WORDS = [
  // Original List A words
  ...WORD_LIST,
  // Semantic distractors (related categories)
  'piano', 'window', 'horn', 'tea', 'college',      // Related to List A words
  'mother', 'sun', 'yard', 'cap', 'teacher',        // Related to List A words
  'eye', 'chicken', 'paint', 'apartment', 'lake',   // Related to List A words
  // Phonetic distractors (similar sounds)
  'rum', 'certain', 'shell', 'toffee', 'fool',      // Phonetically similar
  'baron', 'spoon', 'harden', 'bat', 'charmer',     // Phonetically similar
  'hose', 'hurkey', 'caller', 'mouse', 'sliver',    // Phonetically similar
  // Unrelated distractors
  'table', 'book', 'chair', 'lamp', 'phone',
  'tree', 'stone', 'bread', 'door', 'key'
];
