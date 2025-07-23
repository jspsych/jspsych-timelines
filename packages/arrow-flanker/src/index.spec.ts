import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline } from ".";

describe("createTimeline", () => {
    it("should return a timeline", () => {
        const jsPsych = initJsPsych();

        const timeline = createTimeline(jsPsych);
        expect(timeline).toBeDefined();
    });
});