import { JsPsych } from "jspsych"
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";
import { CurrencyFormatter, CurrencyConfig, CURRENCY_PRESETS } from "./currency";

//console.log("jsPsych experiment loading...");

/**
 * Creates instruction pages with configurable text
 * Uses the jsPsych instructions plugin with simple HTML strings
 */

function createInstructions(instruction_pages_data = instruction_pages) {
  return {
    type: jsPsychInstructions,
    pages: instruction_pages_data.map(page => `<div class="instructions-container"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: trial_text.back_button,
    button_label_next: trial_text.next_button,
    on_finish: function(data: any) {
      data.task = 'bart';
      data.phase = 'instructions';
    }
  };
}


   function getBalloonStyle(pump_count: number) {
     // Use fixed max sizes to prevent overflow and shifts
     const maxBalloonHeightVh = 50; // max 50% viewport height
     const baseHeightPx = 100;
     const growthPerPumpPx = 10; // less aggressive growth to prevent overflow
     
     // Calculate height capped at maxBalloonHeightVh of viewport height
     const maxBalloonHeightPx = window.innerHeight * (maxBalloonHeightVh / 100);
     const estimatedHeightPx = baseHeightPx + pump_count * growthPerPumpPx;
     const finalHeightPx = Math.min(estimatedHeightPx, maxBalloonHeightPx);
     
     // Scale capped to avoid huge transforms
     const scale = 1 + pump_count * 0.02; // slower scale growth
     const cappedScale = Math.min(scale, 1.5);

     return `
       height: ${finalHeightPx}px;
       transform: scale(${cappedScale});
       transform-origin: bottom center;
       width: auto;
     `;
   }

   //generate start instructions
   function showStartInstructions(currencyFormatter?: CurrencyFormatter, currency_unit_per_pump: number = 1) {
   // console.log("showStartInstructions called");
    const formatter = currencyFormatter || new CurrencyFormatter();

     const stimulus = `
         <div class="instructions-container">
         <p>In this task, you will inflate a balloon to earn money.</p>
         <p>Click <strong>${trial_text.pump_button}</strong> to inflate the balloon and earn <strong>${formatter.formatBaseUnit(currency_unit_per_pump)}</strong> per pump.</p>
         <p>Click <strong>${trial_text.collect_button}</strong> to save your money and end the round.</p>
         <p>If the balloon pops, you lose the money for that round!</p>
          <p>Click below to start the task.</p>
         </div>
       `;

  const instructions = {
    type: HtmlButtonResponsePlugin,
    
     stimulus: () => {
       return stimulus;
     },
    choices: [trial_text.start_button],
    button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
    on_finish: function(data: any) {
      data.task = 'bart';
      data.phase = 'instructions';
    }
  }
  return instructions;
   }

      //generate block break screen
   function showBlockBreak(jsPsych: JsPsych, currentBlock: number, totalBlocks: number, currencyFormatter?: CurrencyFormatter) {
   const formatter = currencyFormatter || new CurrencyFormatter();

 const instructions = {
   type: HtmlButtonResponsePlugin,
   
    stimulus: () => {
      // Calculate earnings dynamically when stimulus is displayed
      const data = jsPsych.data.get().filter({ task: 'bart' });
      const totalPoints = data.filter({ exploded: false, cashed_out: true }).select('pump_count').sum();
      
      return `<div class="instructions-container">
      <p>${trial_text.block_complete_message} ${currentBlock} of ${totalBlocks}.</p>
      <p>${trial_text.current_earnings_message} <strong>${formatter.formatBaseUnit(totalPoints)}</strong></p>
      <p>${trial_text.take_break_message}</p>
      </div>`;
    },
   choices: [trial_text.continue_button],
   button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
   on_finish: function(data: any) {
     data.task = 'bart';
     data.phase = 'block-break';
   }
 }
 return instructions;
  }

      //generate end results
   function showEndResults(jsPsych: JsPsych, currencyFormatter?: CurrencyFormatter) {

    const formatter = currencyFormatter || new CurrencyFormatter();
    
   // console.log("showEndResults called");
       const data = jsPsych.data.get().filter({ task: 'bart' });
       const totalPoints = data.filter({ exploded: false, cashed_out: true }).select('pump_count').sum();

     const stimulus = 
     `<div class="instructions-container">
      <p>${trial_text.final_earnings_message} <strong>${formatter.formatBaseUnit(totalPoints)}</strong>!</p>
      <p>${trial_text.thanks_message}</p>
      </div>`;

  const instructions = {
    type: HtmlButtonResponsePlugin,
    
     stimulus: () => {
       return stimulus;
     },
    choices: [trial_text.finish_button],
    button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
    on_finish: function(data: any) {
      data.task = 'bart';
      data.phase = 'end-results';
    }
  }
  return instructions;
   }



function createTrialTimeline(jsPsych: JsPsych, max_pumps: number, min_pumps: number, currency_unit_per_pump: number, trial_timeout?: number, enable_timeout?: boolean, currencyFormatter?: CurrencyFormatter) {
    
// const explosion_range = max_pumps - min_pumps;
//       //const explosion_point = Math.floor(Math.random() * explosion_range) + MIN_PUMPS;
//     const explosion_point = 10; // fixed explosion point for testing
//      let pump_count = 0;
//      let balloon_popped = false;
//      let cashed_out = false;


    let pump_count: number;
    let balloon_popped: boolean;
    let cashed_out: boolean;
    let timed_out: boolean;
    let explosion_point: number;

     const formatter = currencyFormatter || new CurrencyFormatter();

    
    const pump_loop = {
       timeline: [{
         type: HtmlButtonResponsePlugin,
         stimulus: () => {
           const style = getBalloonStyle(pump_count);
           return `
             <div class="trial-container">
               <div class="bart-container">
                 <div class="balloon-area">
                   <img src="images/transparent_balloon.png" style="${style}" />
                 </div>
               </div>
             </div>
           `;
         },
         on_load: () => {
           // Remove old earnings-text if any
           const oldEarnings = document.querySelector('.earnings-text');
           if (oldEarnings) oldEarnings.remove();

           const earningsText = document.createElement('div');
           earningsText.className = 'earnings-text';
             earningsText.innerHTML = `${trial_text.possible_earnings_message} <strong>${formatter.formatPumpEarnings(pump_count, currency_unit_per_pump)}</strong>`;

           const content = document.querySelector('.jspsych-content');
           if (content) {
             content.appendChild(earningsText);
           }
         },
         choices: [trial_text.pump_button, trial_text.collect_button],
         trial_duration: enable_timeout ? trial_timeout : null,
         button_html: (choice: string) => {
              if (choice === trial_text.pump_button) {
                 return `<button class="jspsych-btn continue-button">${choice}</button>`;
              } else {
                 return `<button class="jspsych-btn continue-button">${choice}</button>`;
              }
         },
         on_finish: (data: any) => {
           if (data.response === 0) {
             pump_count++;
             if (pump_count >= explosion_point) {
               balloon_popped = true;
             }
           } else if (data.response === 1) {
             cashed_out = true;
           } else if (data.response === null && enable_timeout) {
             // Timeout occurred - auto collect
             cashed_out = true;
             timed_out = true;
           }
         }
       }],
       loop_function: () => !balloon_popped && !cashed_out
     };

               const outcome = {
       type: HtmlButtonResponsePlugin,
       stimulus: () => {
         const style = getBalloonStyle(pump_count);
         if (balloon_popped) {
           return `
<div class="trial-container">
                <div class="bart-container">
               <div class="balloon-area">
                 <img src="images/transparent_popped_balloon.png" style="${style}" />
               </div>
             </div>
               <div class="task-instructions">
                 <p><strong>POP!</strong> ${trial_text.balloon_popped_message}</p>
                 <p>${trial_text.total_earnings_message} <strong>${formatter.formatBaseUnit(jsPsych.data.get().filter({ task: 'bart', exploded: false, cashed_out: true }).select('pump_count').sum())}</strong></p>
               </div>
             </div>
           `;
         } else {
           const total_points = pump_count + jsPsych.data.get().filter({ task: 'bart', exploded: false, cashed_out: true }).select('pump_count').sum();
           const total_money = total_points * currency_unit_per_pump * 0.01;
           
           const timeoutMessage = timed_out ? `<p><em>${trial_text.timeout_message}</em></p>` : '';

           return `
           <div class="trial-container">
             <div class="task-instructions">
             <p>${trial_text.collected_message} <strong>${formatter.formatBaseUnit(pump_count)}</strong> this round.</p>
             ${timeoutMessage}
             <p>${trial_text.total_earnings_message} <strong>${formatter.formatDecimal(total_money)}</strong></p>
             </div>
           </div>
           `;
         }
       },
       choices: [trial_text.continue_button],
       button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
       on_finish: (data: any) => {
         data.task = 'bart';
         data.phase = 'trial';
         //data.trial_num = trial + 1;
         data.pump_count = pump_count;
         data.exploded = balloon_popped;
         data.cashed_out = cashed_out;
       }
     };

    const singleTrial = {
        timeline: [pump_loop, outcome],
        on_timeline_start: () => {
      pump_count = 0;
      balloon_popped = false;
      cashed_out = false;
      timed_out = false;
      explosion_point = Math.floor(Math.random() * (max_pumps - min_pumps)) + min_pumps;
    }
        
    };
    return singleTrial;
}

export function createTimeline(jsPsych:JsPsych, { 
    max_pumps = 20,
    min_pumps = 1,
    currency_unit_per_pump = 1, //eg 1 cent per pump
    currency_config = CURRENCY_PRESETS.USD, // currency configuration
    num_blocks = 3, // number of blocks in the experiment
    trials_per_block = 10, // number of trials per block
    trial_timeout = 15000, // timeout per trial in milliseconds (15 seconds default)
    enable_timeout = true, // whether to enable auto timeout

} : {
    max_pumps?: number,
    min_pumps?: number,
    currency_unit_per_pump?: number, // eg 1 cent per pump
    currency_config?: CurrencyConfig, // currency configuration
    num_blocks?: number, // number of blocks in the experiment
    trials_per_block?: number, // number of trials per block
    trial_timeout?: number, // timeout per trial in milliseconds
    enable_timeout?: boolean, // whether to enable auto timeout
} = {})
{ 
    //jsPsych = jsPsych;

    const currencyFormatter = new CurrencyFormatter(currency_config);
    const trial = createTrialTimeline(jsPsych, max_pumps, min_pumps, currency_unit_per_pump, trial_timeout, enable_timeout, currencyFormatter);
    
    // Create block structure
    const blocks = [];
    for (let block = 1; block <= num_blocks; block++) {
        // Add trials for this block
        const blockTimeline = {
            timeline: [trial],
            repetitions: trials_per_block,
        };
        blocks.push(blockTimeline);
        
        // Add break screen between blocks (but not after the last block)
        if (block < num_blocks) {
            const blockBreak = showBlockBreak(jsPsych, block, num_blocks, currencyFormatter);
            blocks.push(blockBreak);
        }
    }
    
    const bart_timeline = {
        timeline: blocks
    }
     return bart_timeline;;

};
export const timelineUnits = {
    showStartInstructions,
    showBlockBreak,
    showEndResults,
    createInstructions,
    createTrialTimeline
}

export const utils = {
}

// Export currency functionality
export { CurrencyFormatter, CURRENCY_PRESETS } from './currency';
export type { CurrencyConfig } from './currency';