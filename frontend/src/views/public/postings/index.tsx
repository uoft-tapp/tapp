import React from "react";
import { useParams } from "react-router-dom";
import { apiGET, apiPOST } from "../../../libs/api-utils";
import * as Survey from "survey-react";
//import "survey-react/survey.css";
import "./survey.css";

// XXX This is a temporary function to make all questions optional during debugging
function stripIsRequired(obj: any) {
    let json = JSON.stringify(obj);
    json = json.replaceAll(`"isRequired":true`, `"isRequired":false`);
    return JSON.parse(json);
}

export function PostingView() {
    const params = useParams<{ url_token?: string } | null>();
    const url_token = params?.url_token;
    const [surveyJson, setSurveyJson] = React.useState<any>(null);
    const [surveyPrefilledData, setSurveyPrefilledData] = React.useState<any>(
        null
    );

    React.useEffect(() => {
        if (url_token == null) {
            return;
        }
        async function fetchSurvey() {
            try {
                const details: {
                    survey: any;
                    prefilled_data: any;
                } = await apiGET(`/public/postings/${url_token}`, true);
                setSurveyJson(stripIsRequired(details.survey));
                setSurveyPrefilledData(details.prefilled_data);
            } catch (e) {
                console.warn(e);
            }
        }
        fetchSurvey();
    }, [url_token, setSurveyJson, setSurveyPrefilledData]);

    if (url_token == null) {
        return <React.Fragment>Unknown URL token.</React.Fragment>;
    }

    if (surveyJson == null || surveyPrefilledData == null) {
        return <React.Fragment>Loading...</React.Fragment>;
    }

    Survey.StylesManager.applyTheme("bootstrap");
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    const survey = new Survey.Model(surveyJson);
    survey.showPreviewBeforeComplete = "showAnsweredQuestions";
    survey.showQuestionNumbers = "off";
    survey.onComplete.add((result) =>
        console.log("GOT SURVEY RESULTS", result.data)
    );

    // The utorid is auto-filled when the user is actually taking a survey.
    survey.data = surveyPrefilledData;

    return <Survey.Survey model={survey} />;
}
