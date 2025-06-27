/* This file contains the configurable text used in the pattern comparison timeline.
*/
export const trial_text = {
    same_button: "Same",
    different_button: "Different",
    prompt: "Are these two patterns the same?",
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the pattern comparison task.",
    fixation_cross: "+",
}

/* 
* This is an array of page objects that have configurable texts for the instruction pages before the actual trials
* You can make as many pages as you would like, just add a new array and your text (e.g. ,{header2: "new page here"})
* "page" objects are separated by commas, just as in any array.
* keys, in the order they show on a page: header, header2, description, task_explanation, performance_note,
strategy_title, strategy_intro, strategy_points (array of strings), start_prompt 
* You can leave any keys or text options out if you do not want them in any specific page
*/

export const instruction_pages = [{  //example page, you can remove any of the keys you do not want to use
    header: "header1 in <h1>",
    header2: "header2 in <h2>",
    description: "This is a description of the task in <p>.",
    task_explanation: "More detailed explanation of the task in <p>.",
    performance_note: "Note about performance in <p>.",
    strategy_title: "Strategy Title in <h2>",
    strategy_intro: "Introduction to the strategy in <p>.",
    strategy_points: [
        "Point 1 about the strategy",
        "Point 2 about the strategy",
        "Point 3 about the strategy"
    ],
    start_prompt: "Click continue to start the task.",
    buttons: ["button text", "All buttons will just move onto next page", "they will be registered in data though!"],
    button_html: ["<button class='jspsych-btn'>{choice}</button>", "<button class='jspsych-btn'>{choice}</button>"],
},
    {
    header: "Pattern Comparison Task",               //<h1>
    header2: "Visual Pattern Recognition",     //<h2>
    description: "In this task, you will see two visual patterns displayed side by side.", //<p>
    task_explanation: "Your job is to determine whether the two patterns are exactly the <strong>same</strong> or <strong>different</strong>.", //<p>
    performance_note: "Try to respond as quickly and accurately as possible.",                  //<p>
    
    start_prompt: "Click continue to move to the next page.",  //<p> in bold and blue 
    buttons: ["Continue"],
}, //page two, you can add more pages if needed by creating more objects in the array
{
    strategy_title: "Instructions",
    strategy_intro: "For each trial:",
    strategy_points: [
        "Look carefully at both patterns",
        "Compare all visual elements (shape, color, size, quantity)",
        "Click 'Same' if patterns are identical",
        "Click 'Different' if patterns vary in any way",
        "Respond as quickly and accurately as possible"
    ],
    start_prompt: "Click continue to start the task.",
    buttons: ["Start"],
}];