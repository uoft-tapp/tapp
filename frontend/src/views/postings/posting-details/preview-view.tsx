import React from "react";
import * as Survey from "survey-react";
// For some reason, including these styles makes the survey look worse...
//import "survey-react/survey.css";
import { Posting } from "../../../api/defs/types";
import { profilePage } from "../../../survey/profilePage";

const json: any = {
    completedHtml:
        "<h3>Thank you for your feedback.</h3> <h5>Your thoughts and ideas will help us to create a great product!</h5>",
    pages: [],
    showQuestionNumbers: "off",
};

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

export function ConnectedPostingPreviewView({ posting }: { posting: Posting }) {
    positionsPage.rows = posting.posting_positions.map((postingPosition) => ({
        text:
            postingPosition.position.position_code +
            (postingPosition.position.position_title
                ? ` - ${postingPosition.position.position_title}`
                : ""),
        value: postingPosition.position.position_code,
    }));

    // Assemble the survey
    json.pages.push({
        name: "page1",
        elements: [...profilePage, positionsPage],
    });

    Survey.StylesManager.applyTheme("bootstrap");
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    const survey = new Survey.Model(json);
    survey.onComplete.add((result) =>
        console.log("GOT SURVEY RESULTS", result.data)
    );

    // The utorid is auto-filled when the user is actually taking a survey.
    survey.data = { utorid: "XXXXX" };

    return <Survey.Survey model={survey} />;
}
