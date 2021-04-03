import React from "react";
import { Alert } from "react-bootstrap";
import * as Survey from "survey-react";
import { fetchSurvey } from "../../../api/actions";
// For some reason, including these styles makes the survey look worse...
//import "survey-react/survey.css";
import { Posting } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

export function ConnectedPostingPreviewView({ posting }: { posting: Posting }) {
    const dispatch = useThunkDispatch();
    const [jsonSurvey, setJsonSurvey] = React.useState<any>({});
    // We don't load postings by default, so we load them dynamically whenever
    // we view this page.
    React.useEffect(() => {
        async function fetchResources() {
            try {
                const json = await dispatch(fetchSurvey(posting));
                setJsonSurvey(json);
            } catch (e) {}
        }

        fetchResources();
    }, [posting, dispatch]);

    Survey.StylesManager.applyTheme("bootstrap");
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    const survey = new Survey.Model(jsonSurvey);
    // When we preview the survey, we want to see all the questions rather than a per-page view.
    survey.questionsOnPageMode = "singlePage";
    survey.onComplete.add((result) =>
        console.log("GOT SURVEY RESULTS", result.data)
    );

    // The utorid is auto-filled when the user is actually taking a survey.
    survey.data = {
        utorid: "XXXXX",
    };

    return (
        <React.Fragment>
            <Alert variant="info">
                <i className="fa fa-info-circle mr-1" />
                All pages of this survey are shown together.
            </Alert>
            <Survey.Survey model={survey} />
        </React.Fragment>
    );
}
