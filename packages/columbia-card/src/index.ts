import { JsPsych } from "jspsych"
import jsPsychColumbiaCardTask from "@jspsych-contrib/plugin-columbia-card-task";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";

/**
 * Configuration options for the Columbia Card Task timeline and helpers.
 * Defaults shown reflect the values used in createTimeline unless overridden.
 *
 * @property {boolean} [show_instructions=false] Whether to include the instructions pages at the start.
 * @property {boolean} [show_practice=false] Whether to include the interactive practice section.
 * @property {number}  [num_blocks=3] Number of experimental blocks.
 * @property {number}  [num_trials=5] Trials per block.
 * @property {boolean} [show_debrief=false] Whether to append the debrief summary at the end.
 * @property {boolean} [show_block_summary=true] Whether to show points summary between blocks.
 *
 * Columbia Card Task specific configuration
 * @property {number}  [num_cards=32] Number of cards to display in the grid.
 * @property {number}  [num_loss_cards=3] Number of loss cards in the deck.
 * @property {number}  [grid_columns=8] Number of columns in the card grid.
 * @property {number}  [card_width=60] Card width in pixels.
 * @property {number}  [card_height=80] Card height in pixels.
 * @property {number}  [flip_duration=300] Duration of card flip animation in milliseconds.
 * @property {number}  [loss_value=-250] Points lost when selecting a loss card.
 * @property {number}  [gain_value=10] Points gained when selecting a gain card.
 * @property {number}  [starting_score=0] Starting score for each trial.
 * @property {string}  [card_front_symbol="?"] Symbol displayed on card fronts.
 * @property {string}  [task_instructions] Instructions displayed above the card grid.
 * @property {string}  [gain_cards_label] Text label for gain cards.
 * @property {string}  [loss_cards_label] Text label for loss cards.
 * @property {string}  [score_label] Text label for the score display.
 * @property {string}  [continue_button_text] Text for the continue button.
 *
 * Practice configuration  
 * @property {number}  [practice_num_cards=16] Number of cards in practice rounds.
 * @property {number}  [practice_num_loss_cards=2] Number of loss cards in practice.
 * @property {number}  [practice_gain_value=5] Points gained per card in practice.
 * @property {number}  [practice_loss_value=-50] Points lost per card in practice.
 *
 * Texts
 * @property {string[]}            [instructions_array=instruction_pages] Pages for the instructions screen.
 * @property {typeof trial_text}   [text_object=trial_text] Text/config object with UI strings.
 */
interface ColumbiaCardConfig {
  // general configuration
  show_instructions?: boolean
  show_practice?: boolean
  num_blocks?: number
  num_trials?: number
  show_debrief?: boolean
  show_block_summary?: boolean
  
  // columbia card task specific
  num_cards?: number
  num_loss_cards?: number
  grid_columns?: number
  card_width?: number
  card_height?: number
  flip_duration?: number
  loss_value?: number
  gain_value?: number
  starting_score?: number
  card_front_symbol?: string
  task_instructions?: string
  gain_cards_label?: string
  loss_cards_label?: string
  score_label?: string
  continue_button_text?: string
  
  // practice configuration
  practice_num_cards?: number
  practice_num_loss_cards?: number
  practice_gain_value?: number
  practice_loss_value?: number
  
  // texts
  instructions_array?: string[]
  text_object?: typeof trial_text
}

/**
 * Creates a set of instructions for the Columbia Card Task.
 * 
 * @param {string[]} instructions - Array of instruction pages to display.
 * @param {object} texts - Text configuration object containing messages and labels.
 * @returns {object} jsPsychInstructions trial object.
 */
export function createInstructions(instructions: string[] = instruction_pages, texts = trial_text) {
  if (instructions.length === 0) {
    instructions = instruction_pages;
  }
  return {
    type: jsPsychInstructions,
    pages: instructions.map(page => `<div class="timeline-instructions"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: texts?.back_button ?? texts.back_button,
    button_label_next: texts?.next_button ?? texts.next_button,
    data: { task: 'columbia-card', phase: 'instructions' }
  };
}

/**
 * Creates a practice round completion screen.
 *
 * @param texts Text configuration to render labels.
 * @returns A jsPsych trial for the practice completion screen.
 */
const createPracticeCompletion = (texts = trial_text) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="columbia-card-practice">
          <p>${texts.practiceCompleteContent}</p>
        </div>
    `,
    choices: [texts.beginTaskButton],
    data: { task: 'columbia-card', phase: 'practice', page: 'completion' },
    button_html: (choice: string) => `<button class="jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}

/**
 * Creates a Columbia Card Task trial.
 *
 * @param config Configuration options for the card task.
 * @param texts Text configuration object.
 * @param blockNumber Block number for data tracking.
 * @param trialNumber Trial number for data tracking.
 * @returns A jsPsych trial definition for the Columbia Card Task.
 */
const createColumbiaCardTrial = (config: ColumbiaCardConfig, texts = trial_text, blockNumber?: number, trialNumber?: number, jsPsych?: JsPsych) => {
  return {
    type: jsPsychColumbiaCardTask,
    num_cards: config.num_cards ?? 32,
    num_loss_cards: config.num_loss_cards ?? 3,
    grid_columns: config.grid_columns ?? 8,
    card_width: config.card_width ?? 60,
    card_height: config.card_height ?? 80,
    flip_duration: config.flip_duration ?? 300,
    loss_value: config.loss_value ?? -250,
    gain_value: config.gain_value ?? 10,
    starting_score: config.starting_score ?? 0,
    card_front_symbol: config.card_front_symbol ?? texts.defaultCardFrontSymbol,
    instructions: config.task_instructions ?? texts.defaultInstructions,
    gain_cards_label: config.gain_cards_label ?? texts.defaultGainCardsLabel,
    loss_cards_label: config.loss_cards_label ?? texts.defaultLossCardsLabel,
    score_label: config.score_label ?? texts.defaultScoreLabel,
    continue_button_text: config.continue_button_text ?? texts.defaultContinueButtonText,
    data: {
      task: 'columbia-card',
      phase: 'main-trial',
      block_number: blockNumber,
      trial_number: trialNumber
    },
    on_finish: (data: any) => {
      // Add cumulative tracking
      if (jsPsych) {
        const allTrials = jsPsych.data.get().filter({ task: 'columbia-card', phase: 'main-trial' }).values()
        data.cumulative_points = allTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
        
        if (blockNumber) {
          const blockTrials = allTrials.filter((trial: any) => trial.block_number === blockNumber)
          data.block_cumulative_points = blockTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
        }
      }
    }
  }
}

/**
 * Insert a short break screen between blocks with block summary.
 *
 * @param jsPsych Active jsPsych instance to calculate block statistics.
 * @param blockNum 1-based index of the block that just finished.
 * @param num_blocks Total number of blocks.
 * @param texts Text configuration object.
 * @param showBlockSummary Whether to show block points summary.
 * @returns A jsPsychHtmlButtonResponse screen prompting to continue.
 */
const createBlockBreak = (jsPsych: JsPsych, blockNum: number, num_blocks: number, texts = trial_text, showBlockSummary: boolean = true) => {
  const calculateBlockStats = () => {
    if (!showBlockSummary) return { blockPoints: 0, totalPoints: 0 }
    
    const allTrials = jsPsych.data.get().filter({ task: 'columbia-card', phase: 'main-trial' }).values()
    const blockTrials = allTrials.filter((trial: any) => trial.block_number === blockNum)
    
    const blockPoints = blockTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
    const totalPoints = allTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
    
    return { blockPoints, totalPoints }
  }

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const { blockPoints, totalPoints } = calculateBlockStats()
      
      let content = `<p>${texts.blockBreakContent(blockNum, num_blocks)}</p>`
      
      if (showBlockSummary) {
        content += `
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <p><strong>${texts.blockPointsLabel}</strong> ${blockPoints}</p>
            <p><strong>${texts.totalPointsLabel}</strong> ${totalPoints}</p>
          </div>
        `
      }
      
      return content
    },
    choices: [texts.continueButton],
    data: { 
      task: 'columbia-card', 
      phase: 'block-break-' + blockNum, 
      block_number: blockNum,
      block_points: () => {
        const allTrials = jsPsych.data.get().filter({ task: 'columbia-card', phase: 'main-trial' }).values()
        const blockTrials = allTrials.filter((trial: any) => trial.block_number === blockNum)
        return blockTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
      },
      cumulative_points: () => {
        const allTrials = jsPsych.data.get().filter({ task: 'columbia-card', phase: 'main-trial' }).values()
        return allTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
      }
    },
    button_html: (choice: string) => `<button class="jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}


/**
 * High-level factory that assembles the full Columbia Card Task jsPsych timeline.
 *
 * Example:
 * const { timeline } = createTimeline(jsPsych, { num_blocks: 2, num_cards: 24, show_debrief: true })
 * jsPsych.run(timeline)
 *
 * @param jsPsych Active jsPsych instance.
 * @param config Partial configuration overriding defaults; see ColumbiaCardConfig.
 * @returns An object with a `timeline` array ready for jsPsych.run.
 */
export function createTimeline(
  jsPsych: JsPsych,
  {
    // general
    show_instructions = false,
    show_practice = false,
    num_blocks = 3,
    num_trials = 5,
    show_debrief = false,
    show_block_summary = true,
    // columbia card task specific
    num_cards = 32,
    num_loss_cards = 3,
    grid_columns = 8,
    card_width = 60,
    card_height = 80,
    flip_duration = 300,
    loss_value = -250,
    gain_value = 10,
    starting_score = 0,
    card_front_symbol = trial_text.defaultCardFrontSymbol,
    task_instructions = trial_text.defaultInstructions,
    gain_cards_label = trial_text.defaultGainCardsLabel,
    loss_cards_label = trial_text.defaultLossCardsLabel,
    score_label = trial_text.defaultScoreLabel,
    continue_button_text = trial_text.defaultContinueButtonText,
    // practice configuration
    practice_num_cards = 16,
    practice_num_loss_cards = 2,
    practice_gain_value = 5,
    practice_loss_value = -50,
    // texts
    instructions_array: instructions = instruction_pages,
    text_object: texts = trial_text,
  } : ColumbiaCardConfig = {})
{
  const timeline = []

  if (show_instructions) {
    timeline.push(createInstructions(instructions, texts))
  }

  if (show_practice) {
    const practiceTrials = createPractice({
      num_cards: practice_num_cards,
      num_loss_cards: practice_num_loss_cards,
      grid_columns,
      card_width,
      card_height,
      flip_duration,
      loss_value: practice_loss_value,
      gain_value: practice_gain_value,
      starting_score,
      card_front_symbol,
      task_instructions,
      gain_cards_label,
      loss_cards_label,
      score_label,
      continue_button_text,
      text_object: texts
    })
    timeline.push(...practiceTrials)
  }

  // Generate blocks
  for (let blockNum = 1; blockNum <= num_blocks; blockNum++) {
    // Add block trials
    for (let trialNum = 1; trialNum <= num_trials; trialNum++) {
      const cardTrial = createColumbiaCardTrial({
        num_cards,
        num_loss_cards,
        grid_columns,
        card_width,
        card_height,
        flip_duration,
        loss_value,
        gain_value,
        starting_score,
        card_front_symbol,
        task_instructions,
        gain_cards_label,
        loss_cards_label,
        score_label,
        continue_button_text
      }, texts, blockNum, trialNum, jsPsych)
      
      timeline.push(cardTrial)
    }
    
    // Add block break page between blocks (except after last block)
    if (blockNum < num_blocks) {
      const blockBreakTrial = createBlockBreak(jsPsych, blockNum, num_blocks, texts, show_block_summary)
      timeline.push(blockBreakTrial)
    }
  }

  if (show_debrief) {
    const debriefTrial = createDebrief(jsPsych, texts)
    timeline.push(debriefTrial)
  }

  return {
    timeline
  }
}

/**
 * Create the practice section.
 *
 * @param config Partial configuration to select sample parameters and texts.
 * @returns An array of practice timeline segments to be inserted into the main timeline.
 */
function createPractice(config: ColumbiaCardConfig = {}) {
  const texts = config.text_object ?? trial_text
  
  // Practice introduction
  const practiceIntro = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="timeline-instructions"><p>${texts.practiceIntroContent}</p></div>`,
    choices: [texts.continueButton],
    data: { task: 'columbia-card', phase: 'practice', page: 'intro' },
    button_html: (choice: string) => `<button class="jspsych-btn timeline-html-btn">${choice}</button>`,
  }

  // Single practice trial
  const practiceTrial = createColumbiaCardTrial(config, texts, 0, 0) // block 0, trial 0 for practice
  practiceTrial.data.phase = 'practice-trial'

  return [
    practiceIntro,
    practiceTrial,
    createPracticeCompletion(texts)
  ]
}

/**
 * Create the end-of-experiment debrief screen showing overall performance.
 *
 * @param jsPsych Active jsPsych instance from which results are derived.
 * @param texts Text configuration object.
 * @returns A jsPsych trial object for the debrief.
 */
function createDebrief(jsPsych: JsPsych, texts = trial_text) {
  const calculateStats = () => {
    const allTrials = jsPsych.data.get().filter({ task: 'columbia-card', phase: 'main-trial' }).values()
    
    if (allTrials.length === 0) return { totalScore: 0, totalCards: 0, avgPointsPerCard: 0, riskScore: 'N/A', blockBreakdown: [] }
    
    // Calculate total score across all trials
    const totalScore = allTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
    
    // Calculate total cards flipped
    const totalCards = allTrials.reduce((sum: number, trial: any) => sum + (trial.total_clicks || 0), 0)
    
    // Calculate average points per card
    const avgPointsPerCard = totalCards > 0 ? Math.round((totalScore / totalCards) * 10) / 10 : 0
    
    // Calculate block-by-block breakdown
    const blockBreakdown = []
    const uniqueBlocks = [...new Set(allTrials.map((trial: any) => trial.block_number))].sort()
    
    for (const blockNum of uniqueBlocks) {
      const blockTrials = allTrials.filter((trial: any) => trial.block_number === blockNum)
      const blockPoints = blockTrials.reduce((sum: number, trial: any) => sum + (trial.total_points || 0), 0)
      const blockCards = blockTrials.reduce((sum: number, trial: any) => sum + (trial.total_clicks || 0), 0)
      
      blockBreakdown.push({
        block: blockNum,
        points: blockPoints,
        cards: blockCards,
        avgPerCard: blockCards > 0 ? Math.round((blockPoints / blockCards) * 10) / 10 : 0
      })
    }
    
    // Calculate risk-taking score (cards flipped as percentage of total available)
    const totalPossibleCards = allTrials.length * (allTrials[0]?.card_values?.length || 32)
    const riskPercentage = totalPossibleCards > 0 ? (totalCards / totalPossibleCards) * 100 : 0
    
    let riskScore = ''
    if (riskPercentage < 30) {
      riskScore = texts.riskAssessmentConservative
    } else if (riskPercentage < 60) {
      riskScore = texts.riskAssessmentModerate
    } else {
      riskScore = texts.riskAssessmentAggressive
    }
    
    return { totalScore, totalCards, avgPointsPerCard, riskScore, blockBreakdown }
  }

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const { totalScore, totalCards, avgPointsPerCard, riskScore, blockBreakdown } = calculateStats()
      
      let blockTable = ''
      if (blockBreakdown.length > 1) {
        blockTable = `
          <div style="margin: 20px 0;">
            <h3>Round-by-Round Breakdown:</h3>
            <table style="border-collapse: collapse; margin: 0 auto; text-align: center;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #dee2e6; padding: 8px;">Round</th>
                  <th style="border: 1px solid #dee2e6; padding: 8px;">Points</th>
                  <th style="border: 1px solid #dee2e6; padding: 8px;">Cards</th>
                  <th style="border: 1px solid #dee2e6; padding: 8px;">Avg/Card</th>
                </tr>
              </thead>
              <tbody>
                ${blockBreakdown.map(block => `
                  <tr>
                    <td style="border: 1px solid #dee2e6; padding: 8px;">${block.block}</td>
                    <td style="border: 1px solid #dee2e6; padding: 8px;">${block.points}</td>
                    <td style="border: 1px solid #dee2e6; padding: 8px;">${block.cards}</td>
                    <td style="border: 1px solid #dee2e6; padding: 8px;">${block.avgPerCard}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `
      }
      
      return `
        <div class="columbia-card-debrief">
          <h2>${texts.taskComplete}</h2>
          <p><strong>${texts.finalScoreLabel}</strong> ${totalScore}</p>
          <p><strong>${texts.totalCardsFlippedLabel}</strong> ${totalCards}</p>
          <p><strong>${texts.averagePointsPerCardLabel}</strong> ${avgPointsPerCard}</p>
          ${blockTable}
          <p><strong>${texts.riskTakingScoreLabel}</strong></p>
          <p style="font-style: italic;">${riskScore}</p>
          <p>${texts.thanksMessage}</p>
        </div>
      `
    },
    choices: [texts.finishButton],
    data: { task: 'columbia-card', phase: 'debrief' },
    button_html: (choice: string) => `<button class="jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}

/**
 * Namespaced access to building blocks for advanced composition and testing.
 */
export const timelineUnits = {
  createInstructions,
  createPractice,
  createDebrief
}

/**
 * Utility exports used by consumers and tests.
 */
export const utils = {
  createColumbiaCardTrial,
  createBlockBreak,
  createPracticeCompletion
}