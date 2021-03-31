import React from "react";
import * as Survey from "survey-react";
// For some reason, including these styles makes the survey look worse...
//import "survey-react/survey.css";
import { Posting } from "../../../api/defs/types";
import { assembleSurvey } from "../../../survey";

export function ConnectedPostingPreviewView({ posting }: { posting: Posting }) {
    // Assemble the survey
    const json = assembleSurvey(posting);

    Survey.StylesManager.applyTheme("bootstrap");
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    const survey = new Survey.Model(json);
    survey.onComplete.add((result) =>
        console.log("GOT SURVEY RESULTS", result.data)
    );

    // The utorid is auto-filled when the user is actually taking a survey.
    survey.data = {
        utorid: "XXXXX",
    };

    return <Survey.Survey model={survey} />;
}
