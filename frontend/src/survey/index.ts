import { Posting } from "../api/defs/types";
import { profilePage } from "./profilePage";
import { statusPage } from "./statusPage";

const surveyContainer: any = {
    completedHtml: "<h3>Thank you for your application.</h3>",
    pages: [],
    showQuestionNumbers: "off",
};

// The survey.js element where the applicant picks their assignment preferences.
const positionsPage: any = {
    type: "matrix",
    name: "position_preferences",
    title: "Please rank your preferences for the available positions.",
    cellType: "rating",
    columns: [
        { value: 3, text: "High" },
        { value: 2, text: "Medium" },
        { value: 1, text: "Low" },
        { value: 0, text: "N/A" },
        { value: -1, text: "Strong Preference Against" },
    ],
    rows: [],
};

export function assembleSurvey(posting: Posting) {
    // Make copies of the survey pages before we mangle them.
    const container = JSON.parse(JSON.stringify(surveyContainer));
    const positions = JSON.parse(JSON.stringify(positionsPage));

    container.pages.push({
        name: "page1",
        elements: [...profilePage, ...statusPage, positions],
    });

    // Populate the answer matrix with options from the PostingPositions
    positions.rows = posting.posting_positions.map((postingPosition) => ({
        text:
            postingPosition.position.position_code +
            (postingPosition.position.position_title
                ? ` - ${postingPosition.position.position_title}`
                : ""),
        value: postingPosition.position.position_code,
    }));

    return container;
}
