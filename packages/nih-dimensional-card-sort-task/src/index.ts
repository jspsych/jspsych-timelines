import { JsPsych } from "jspsych";
import jsPsychHTMLButtonResponse from "@jspsych/plugin-html-button-response";

// possible options for timeline: 
// - something that decides whether buildTimelineVariables() tests every dimensions
// - something that decides whether to buildTimelineVariables() tests every option of a dimension

const svgDog = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" viewBox="0 0 888 483.61099" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/">
    <!--dog coat-->
    <path d="m406,438.53481c5,24,33.5-5.5,33.5-5.5l34-4s21.5.5,35.5,11.5,23.5-3.5,23.5-3.5c15.77283,5.2576,35.09692,5.23627,51.83264,3.55252,24.11597-2.42627,43.44604-21.04041,46.76044-45.05038,18.69678-135.44147-84.09314-202.00211-84.09314-202.00211l-30-81s9.5-23.5,12.5-44.5-19-41-46-61c-11.8125-8.75-25.34766-8.12109-36.83716-4.64502-12.88892,3.89946-24.13214,11.9183-32.4397,22.51616-6.88251,8.77995-18.68735,21.21468-31.66315,23.36885-4.48999.73999-8.91998,2.52002-13.06,5.76001-4.28003,3.34998-6.16998,8.94-6.22998,15.89001-.32001,30.35999,24.75,66.90998,46.72998,72.60999,27,7,12.5,73.5,12.5,73.5-44,62-13,131-13,131l-8,56s-.5,11.5,4.5,35.5l.00006-.00003Z" fill="#3f3d56"/>
    <!--right leg-->
    <path d="m553,309.53481l-11,137s15,38-36,36-21-80-21-80l16-102" fill="#3f3d56"/>
    <!--right leg outline-->
    <path d="m509.79492,483.61099c-1.24707,0-2.52344-.02539-3.83398-.07715-11.29004-.44238-19.60352-4.60059-24.71094-12.3584-14.60254-22.18164,1.63867-65.90625,2.77832-68.89941l15.9834-101.89648c.08594-.5459.59375-.91309,1.14355-.83301.54492.08594.91797.59766.83301,1.14355l-16,102c-.01172.06934-.0293.1377-.05469.2041-.1748.45215-17.25195,45.55566-3.01172,67.18359,4.73242,7.18652,12.50977,11.04199,23.11719,11.45801,16.65234.64941,27.85254-2.90332,33.29785-10.56836,7.12402-10.02832,1.78711-23.92676,1.73242-24.06641-.05566-.1416-.07812-.29492-.06641-.44629l11-137c.04395-.5498.5166-.95117,1.07715-.91699.55078.04492.96094.52637.91699,1.07715l-10.98242,136.77539c.72656,1.96094,5.28223,15.4043-2.03906,25.72363-5.41699,7.63574-15.89844,11.49707-31.18066,11.49707Z" fill="#2f2e41"/>
    <!--left leg-->
    <path d="m462,337.53481s3,127-60,124-6-43-6-43l5.5-15.5" fill="#3f3d56"/>
    <!--left leg outline-->
    <path d="m404.16211,462.58657c-.73145,0-1.4668-.01758-2.20996-.05273-17.98828-.85645-28.15186-4.88672-30.20801-11.97852-3.7041-12.7793,20.43945-30.52148,23.41895-32.65332l5.39453-15.20117c.18457-.52148.75586-.79297,1.27637-.6084s.79297.75586.6084,1.27637l-5.5,15.5c-.06934.19629-.19824.36523-.36816.48438-.26367.18555-26.37744,18.68457-22.90869,30.64551,1.79248,6.18066,11.34131,9.72559,28.38232,10.53711,11.34863.5459,21.29688-3.27051,29.55078-11.3291,30.95215-30.21582,29.4209-110.83789,29.40137-111.64844-.0127-.55176.42383-1.00977.97656-1.02344.52246.00098,1.00977.4248,1.02344.97656.0791,3.3457,1.57227,82.29785-30.00293,113.125-8.12793,7.93555-17.82031,11.9502-28.83496,11.9502Z" fill="#2f2e41"/>
    <!--nose-->
    <path d="m363.27002,69.92484c7.17999.85999,18.41998.81995,27.72998-5.39001,9.96997-6.65002-.38-12.85004-8.44-16.26001-4.48999.73999-8.91998,2.52002-13.06,5.76001-4.28003,3.34998-6.16998,8.94-6.22998,15.89001Z" fill="#2f2e41"/>
    <!--ear-->
    <path d="m479.2984,51.94388s-17.44968-44.81639,7.54245-45.4435,44.73257,38.20994,44.73257,38.20994c0,0,62.72797,114.34248-23.21378,108.17637-85.94171-6.16615-44.87375-51.81067-44.87375-51.81067,0,0,19.60165-24.09928,15.81253-49.13211h-.00003v-.00002h0s0-.00002,0-.00002Z" fill="#2f2e41"/>
    <!--tail-->
    <path d="m575.03857,386.85064c11.06787,4.92365,22.63171,9.948,34.73578,9.46738s24.84155-8.27557,26.72772-20.24146c.97363-6.17697-.95746-12.80396,1.40759-18.59268,3.18213-7.78867,13.44672-10.79233,21.42578-8.12323s13.84076,9.55188,18.04358,16.84058c7.86328,13.63672,11.0141,31.53461,2.58307,44.82779-7.30878,11.52368-21.17084,16.73105-34.06519,21.19748-17.17535,5.94928-36.35114,11.854-52.99396,4.54617-16.7381-7.34964-25.85565-28.58435-19.65753-45.7821" fill="#3f3d56"/>
    <!--collar-->
    <path d="m538.1142,170.92143s22,11,11,23-79,46-104,41-31-20-31-24,1.88583-52.38661,9.88583-50.38661,58.11417,47.38661,114.11417,10.38661Z" fill="#6c63ff"/>
    </svg>`

const svgCat = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" viewBox="0 0 888 342.09" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/">
    <!--cat coat-->
    <path d="m560.17,337.74l-141.49-4.02s10.65-63.71-23.52-81.39c-23.29-12.06-43.96-68.39-38.08-106.72.08-.51.16-1.02.25-1.52,2.98-17.16,11.5-30.45,27.79-34.06,52.66-11.66,90.24-2.62,90.24-2.62,0,0,8.7.11,21.59,2.53.46.08.92.17,1.38.27,36.49,7.15,103.94,32.61,106.86,123.01,4.02,124.2-45.02,104.5-45.02,104.5Z" fill="#3f3d56"/>
    <!--collar-->
    <path d="m496.95,109.95c-.24,6.48-1.71,12.92-4.39,19.04-5.56,12.69-15.7,22.38-28.54,27.29-38.46,14.72-83.34.12-106.04-15.71-.09.5-1.89,9.99-1.97,10.5,10.05,6.88,59.24,13.51,68.57,13.51,14.17,0,27.81-2.35,39.94-7,13.19-5.05,23.6-15.01,29.31-28.04,2.73-6.22,4.23-12.75,4.5-19.33-.46-.1-.92-.19-1.38-.27,0,0,0,0,0,0Z" fill="#6c63ff"/>
    <!--face-->
    <path d="m507.41,118.2l-22.55-56.71s27.07-46.4,5.8-51.55c-21.27-5.16-43.18,22.55-43.18,22.55,0,0-40.6-14.18-56.06-2.58,0,0-25.78-36.09-41.24-29-15.47,7.09,5.5,58.18,5.5,58.18,0,0-31.92,46.86-7.43,73.92,24.49,27.07,116.64,48.98,159.17-14.82h0Z" fill="#3f3d56"/>
    <!--tail-->
    <path d="m555.78,303.8c7.68,3.42,15.7,6.9,24.1,6.57s17.23-5.74,18.54-14.04c.68-4.29-.66-8.88.98-12.9,2.21-5.4,9.33-7.49,14.86-5.64,5.54,1.85,9.6,6.63,12.52,11.68,5.46,9.46,7.64,21.88,1.79,31.1-5.07,7.99-14.69,11.61-23.63,14.71-11.92,4.13-25.22,8.22-36.77,3.15-11.61-5.1-17.94-19.83-13.64-31.76" fill="#3f3d56"/>
    <!--nose-->
    <path d="m428.74,92.71s-13.88-5.55-22.89,1.39l10.41,15.96s12.49-17.34,12.49-17.34Z" fill="#6c63ff"/>
    <!--left leg-->
    <path d="m355.89,165.55l25.67,136.68s-38.85,39.55,11.1,38.85c49.95-.69,35.38-26.36,35.38-26.36l-15.96-118.64" fill="#3f3d56"/>
    <!--left leg outline-->
    <path d="m391.4,342.09c-13.53,0-21.71-3.1-24.33-9.23-4.77-11.16,10.76-28.17,13.42-30.97l-17.26-102.18,1.97-.33,17.43,103.18-.36.36c-.18.18-17.94,18.45-13.36,29.15,2.35,5.5,10.32,8.19,23.74,8,18.65-.26,30.67-4.17,34.77-11.3,3.69-6.42-.21-13.5-.25-13.57l-.09-.17-.03-.19-11.1-82.56,1.98-.27,11.08,82.38c.66,1.25,4.11,8.46.16,15.36-4.53,7.9-16.81,12.05-36.49,12.32-.43,0-.85,0-1.27,0Z" fill="#2f2e41"/>
    <!--right leg-->
    <path d="m421.1,165.55l25.67,136.68s-38.85,39.55,11.1,38.85c49.95-.69,35.38-26.36,35.38-26.36l-15.96-118.64" fill="#3f3d56"/>
    <!--right leg outline-->
    <path d="m456.61,342.09c-13.53,0-21.71-3.1-24.33-9.23-4.77-11.14,10.73-28.13,13.41-30.96l-10.31-55,1.97-.37,10.5,56.02-.37.37c-.18.18-17.94,18.45-13.36,29.15,2.35,5.5,10.33,8.2,23.74,8,18.66-.26,30.69-4.17,34.78-11.32,3.69-6.44-.22-13.48-.26-13.55l-.1-.17-15.98-118.83,1.98-.27,15.93,118.46c.66,1.25,4.11,8.46.16,15.36-4.53,7.9-16.81,12.05-36.49,12.32-.43,0-.85,0-1.27,0Z" fill="#2f2e41"/>
    </svg>`

interface Stimulus { // haven't found a use for this type yet in the flow of developing this protocol, but it seemed possibly useful from the URSI build
    shape: string;
    color: string;
}

// this and the next variable are only ever used in buildStimulus(), or to build the dimensions object
var colors = {
    green: "#1a7815", //could this be made prettier using css root definitions?
    blue: "#181c92",
    red: "#991a1a"
};

var shapes = {
    dog: svgDog,
    cat: svgCat
};

// so far, this global variable is called in both buildTimelineVariables() and buildChoices(), and its the source of any argument for rollDimension()
var dimensions = {
    shape: Object.keys(shapes),
    color: Object.keys(colors)
}

function rollDimension(dimension) { // the argument dimension has to be a property of the global dimensions object; this should be fixed
    var winner = dimension[dimension.length * Math.random() << 0 ];
    return winner;
}

function buildStimulus(stim: Stimulus) {
    var template = shapes[stim.shape]
    var colorCode = colors[stim.color]
    return template.replace(/#3f3d56/g, `${colorCode}`); // need a better way to format templates and grab relevant hexcode
}

function buildPrompt(targetInfo) {
    return `<p>Which side is the <strong>same ${targetInfo.dimension}</strong> as the top image?</p>`;
}

function buildChoices(stimInfo, targetInfo) {
    const targetChoice = targetInfo.choice;
    const targetDimension = targetInfo.dimension;

    var choices = {
        left: {
            target: false,
            color: rollDimension(dimensions.color),
            shape: rollDimension(dimensions.shape)
        },
        right: {
            target: false,
            color: rollDimension(dimensions.color),
            shape: rollDimension(dimensions.shape)
        }
    }

    choices[targetChoice].target = true;
    const targetDimensionValue = stimInfo[targetDimension];

    for (const choice in choices) {
        if (choices[choice].target) {
            choices[choice][targetDimension] = targetDimensionValue;
        } else {
            const rest = dimensions[targetDimension].filter(d => d !== targetDimensionValue);
            choices[choice][targetDimension] = rollDimension(rest);
        }
    }

    return [buildStimulus(choices.left), 
            buildStimulus(choices.right)];
}

function buildTimelineVariable() {
    var variables = [];

    const choices = ['left', 'right'];

    for (const choice of choices) {
        for (const dimension of Object.keys(dimensions)) {
            for (const color of dimensions.color) {
                for (const shape of dimensions.shape) {
                    const stim = {
                        shape: shape,
                        color: color
                    };
                    variables.push({
                        target: {
                            choice: choice,
                            dimension: dimension
                        },
                        stim: stim
                    });
                }
            }
        }
    }
    console.log(`timeline variables are ${JSON.stringify(variables)}`);
    return variables;
}

function createTrial(jsPsych: JsPsych) {
    return {
        type: jsPsychHTMLButtonResponse,
        stimulus: () => {
            return buildStimulus(jsPsych.evaluateTimelineVariable('stim'))
        },
        stimulus_width: 150,
        prompt: () => buildPrompt(jsPsych.evaluateTimelineVariable('target')),
        choices: () => buildChoices(
                            jsPsych.evaluateTimelineVariable('stim'), 
                            jsPsych.evaluateTimelineVariable('target')),
        button_html: (choice: string) => `${choice}`
    };
}

export function createTimeline(jsPsych:JsPsych){
    var timeline = [];

    var test_procedure = {
        timeline: [createTrial(jsPsych)],
        timeline_variables: buildTimelineVariable(),
        randomize_order: true,
        repetitions: 1,
    };

    timeline.push(test_procedure);

    return timeline;
};

export const timelineUnits = {
    createTrial,
};

export const utils = {
    buildStimulus,
    buildPrompt,
    buildChoices,
    rollDimension
};