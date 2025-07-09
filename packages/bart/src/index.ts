import { JsPsych } from "jspsych"
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";

//console.log("jsPsych experiment loading...");


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
   function showStartInstructions() {
   // console.log("showStartInstructions called");
    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
     });

     let currency_unit_per_pump = .01;

     const stimulus = `
        <h1>Balloon Analog Risk Task (BART)</h1>
         <p>In this task, you will inflate a balloon to earn money.</p>
         <p>Click <strong>Pump</strong> to inflate the balloon and earn <strong>${USDollar.format(.01*currency_unit_per_pump)}</strong> per pump.</p>
         <p>Click <strong>Collect</strong> to save your money and end the round.</p>
         <p>If the balloon pops, you lose the money for that round!</p>
          <p>Click below to start the task.</p>
       `;

  const instructions = {
    type: HtmlButtonResponsePlugin,
    
     stimulus: () => {
       return stimulus;
     },
    choices: ['Start']
  }
  return instructions;
   }

      //generate end results
   function showEndResults(jsPsych: JsPsych) {

    let USDollar = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
      });
    
   // console.log("showEndResults called");
       const data = jsPsych.data.get().filter({ task: 'bart' });
       const totalPoints = data.filter({ exploded: false, cashed_out: true }).select('pump_count').sum();

     const stimulus = 
     `<p>You earned a total of <strong>${USDollar.format(totalPoints * 0.01)}</strong>!</p>
      <p>Thanks for participating!</p>`;

  const instructions = {
    type: HtmlButtonResponsePlugin,
    
     stimulus: () => {
       return stimulus;
     },
    choices: ['Finish']
  }
  return instructions;
   }



function createTrialTimeline(jsPsych: JsPsych, max_pumps: number, min_pumps: number, currency_unit_per_pump: number) {
    
// const explosion_range = max_pumps - min_pumps;
//       //const explosion_point = Math.floor(Math.random() * explosion_range) + MIN_PUMPS;
//     const explosion_point = 10; // fixed explosion point for testing
//      let pump_count = 0;
//      let balloon_popped = false;
//      let cashed_out = false;


    let pump_count: number;
    let balloon_popped: boolean;
    let cashed_out: boolean;
    let explosion_point: number;

     let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
     });

    
    const pump_loop = {
       timeline: [{
         type: HtmlButtonResponsePlugin,
         stimulus: () => {
           const style = getBalloonStyle(pump_count);
           return `
             <div class="bart-container">
               <div class="balloon-area">
                 <img src="images/transparent_balloon.png" style="${style}" />
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
             earningsText.innerHTML = `Possible earnings this round: <strong>${USDollar.format(pump_count * currency_unit_per_pump * 0.01)}</strong>`;

           const content = document.querySelector('.jspsych-content');
           if (content) {
             content.appendChild(earningsText);
           }
         },
         choices: ['Pump', 'Collect'],
         button_html: (choice, index)=>{
              if (choice === 'Pump') {
                 return `<button class="jspsych-btn jspsych-bart-pump-button">${choice}</button>`;
              } else {
                 return `<button class="jspsych-btn jspsych-bart-collect-button">${choice}</button>`;
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
<div style="text-align: center; max-width: 600px; margin: 0 auto;">
                <div class="bart-container">
               <div class="balloon-area">
                 <img src="images/transparent_popped_balloon.png" style="${style}" />
               </div>
             </div>
               <div style="text-align: center; max-width: 600px;">
                 <p><strong>POP!</strong> The balloon exploded. You earned <strong>${USDollar.format(0)}</strong> this round.</p>
                 <p>Total earnings across all rounds: <strong>${USDollar.format(.01* jsPsych.data.get().filter({ task: 'bart', exploded: false, cashed_out: true }).select('pump_count').sum())}</strong></p>
               </div>
             </div>
           `;
         } else {
           const total_points = pump_count + jsPsych.data.get().filter({ task: 'bart', exploded: false, cashed_out: true }).select('pump_count').sum();
           const total_money = total_points * currency_unit_per_pump * 0.01;

           return `
             <p>You collected <strong>${USDollar.format(.01*pump_count)}</strong> this round.</p>
             <p>Total earnings across all rounds: <strong>${USDollar.format(total_money)}</strong></p>
           `;
         }
       },
       choices: ['Continue'],
       on_finish: (data: any) => {
         data.task = 'bart';
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
      explosion_point = Math.floor(Math.random() * (max_pumps - min_pumps)) + min_pumps;
    }
        
    };
    return singleTrial;
}

export function createTimeline(jsPsych:JsPsych, { 
    max_pumps = 20,
    min_pumps = 1,
    currency_unit_per_pump = 1, //eg 1 cent per pump
    num_trials = 5, // number of trials in the experiment

} : {
    max_pumps?: number,
    min_pumps?: number,
    currency_unit_per_pump?: number, // eg 1 cent per pump
    num_trials?: number, // number of trials in the experiment
} = {})
{ 
    //jsPsych = jsPsych;

    const trial = createTrialTimeline(jsPsych, max_pumps, min_pumps, currency_unit_per_pump);
    const bart_timeline = {
        timeline: [trial],
        repetitions: num_trials,
    }
     return bart_timeline;;

};
export const timelineUnits = {
    createTrialTimeline
}

export const utils = {
    showStartInstructions,
    showEndResults 
}