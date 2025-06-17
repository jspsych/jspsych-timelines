/* This file contains the configurable text used in the timeline.
replaceable holders: {n_back}, {plural}, {trial}, {total} */
export const trial_text = {
    button: "MATCH",
    prompt: "Click the MATCH button if the current position matches the position from {n_back} trial{plural} ago. (trial {trial} of {total})",
    correct: "Correct!",
    incorrect: "Incorrect!",
}

/* 
* This is an array of page objects that have configurable texts for the instruction pages before the actual trials
* You can make as many pages as you would like, just add a new array and your text (e.g. ,{header2: "new page here"})
* "page" objects are separated by commas, just as in any array.
* keys, in the order they show on a page: header, header2, description, task_explanation, performance_note,
strategy_title, strategy_intro, strategy_points (array of strings), start_prompt 
* You can leave any keys or text options out if you do not want them in any specific page
*/

export const instruction_pages = [{
    header: "Spatial N-Back Task",               //<h1>
    header2: "Memory for Spatial Locations",     //<h2>
    description: "In this task, you will see a grid with blue squares appearing in different positions.", //<p>
    task_explanation: "Your job is to click the MATCH button whenever the current position is the same as the position from <strong>1  trial ago</strong>.", //<p>
    performance_note: "Try to respond as quickly and accurately as possible.",                  //<p>

    start_prompt: "Click the continue to move to the next page.",  //<p> in bold and blue 
}, //page two, you can add more pages if needed by creating more objects in the array
{
    strategy_title: "Strategy",
    strategy_intro: "Before each trial, remember:",
    strategy_points: [
        "Watch the grid carefully",
        "Remember positions from ONE trial ago",
        "Click MATCH only when positions match",
        "Respond quickly but accurately"
    ],
    start_prompt: "Click continue to start the practice trial.",
}];