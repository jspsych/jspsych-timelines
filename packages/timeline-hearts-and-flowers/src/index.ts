import { JsPsych } from "jspsych"
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response"



enum StimulusType {
    HEARTS = "hearts",
    FLOWERS = "flowers",
    HEARTSANDFLOWERS = "hearts and flowers"
}

/**
 * Announces the beginning of a game section.
 * @param stimulusType An enum that represents the type of stimulus that will be displayed.
 * @returns A string that contains the instructions for the game.
 */
function getInstructions(stimulusType: StimulusType) {
    const stimulus = `
    <div class="jspsych-hearts-and-flowers-instruction"><h3>
    This is the ${stimulusType} game. Here's how you play it.
    `
    const instructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: stimulus,
        choices: ["OK"],
    }

    return instructions
} 

/**
 * Creates a practice section that consists of instructions, demos and 2 practice trials.
 */
function createPractice() {

}

/**
 * Creates a section of the timeline that consists of the practice section and trials section.
 */
function createFullSection() {

}

export function createTimeline(jsPsych: JsPsych, { }) {
    

}

export const timelineUnits = {}

export const utils = {}