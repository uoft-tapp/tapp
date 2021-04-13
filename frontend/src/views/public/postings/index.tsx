import React from "react";
import { useParams } from "react-router-dom";
import { apiGET, apiPOST } from "../../../libs/api-utils";
import * as Survey from "survey-react";
//import "survey-react/survey.css";
import "./survey.css";
import { Button, Modal, Spinner } from "react-bootstrap";

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
    const [surveyData, setSurveyData] = React.useState<any>(null);
    const [submitDialogVisible, setSubmitDialogVisible] = React.useState(false);
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const [waiting, setWaiting] = React.useState(false);

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

    const survey = React.useMemo(() => {
        Survey.StylesManager.applyTheme("bootstrap");
        Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
        const survey = new Survey.Model(surveyJson);
        survey.showPreviewBeforeComplete = "showAnsweredQuestions";
        survey.showQuestionNumbers = "off";

        // The utorid is auto-filled when the user is actually taking a survey.
        survey.data = surveyData || surveyPrefilledData;

        // If the data has changed but we've finished the survey, make sure to set the survey to
        // a finished state.
        if (hasSubmitted) {
            setTimeout(() => survey.doComplete(), 0);
        }

        return survey;
    }, [surveyJson, surveyData, surveyPrefilledData, hasSubmitted]);

    React.useEffect(() => {
        // We only want to add this callback once when the survey is initialized
        survey.onCompleting.add((result, options) => {
            if (!hasSubmitted) {
                options.allowComplete = false;
                setSurveyData(result.data);
                setSubmitDialogVisible(true);
                setTimeout(() => survey.showPreview(), 0);
            }
        });
    }, [survey, setSurveyData, setSubmitDialogVisible, hasSubmitted]);

    if (url_token == null) {
        return <React.Fragment>Unknown URL token.</React.Fragment>;
    }

    if (surveyJson == null || surveyPrefilledData == null) {
        return <React.Fragment>Loading...</React.Fragment>;
    }

    async function confirmClicked() {
        console.log("Submitting data", surveyData);
        try {
            setWaiting(true);
            await apiPOST(
                `/public/postings/${url_token}/submit`,
                { answers: surveyData },
                true
            );
            setHasSubmitted(true);
            survey.doComplete();
            setSurveyData(surveyPrefilledData);
            setSubmitDialogVisible(false);
        } catch (e) {
            console.warn(e);
        } finally {
            setWaiting(false);
        }
    }

    function hideDialogAndResetData() {
        survey.data = surveyData || survey.data;
        setHasSubmitted(false);
        setSubmitDialogVisible(false);
    }

    return (
        <React.Fragment>
            <Survey.Survey model={survey} />
            <Modal show={submitDialogVisible} onHide={hideDialogAndResetData}>
                <Modal.Header closeButton>
                    <Modal.Title>Submit Application</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to submit this TA application?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={hideDialogAndResetData}
                    >
                        Cancel
                    </Button>
                    <Button onClick={confirmClicked}>
                        {waiting ? (
                            <span className="spinner-surround">
                                <Spinner animation="border" size="sm" />
                            </span>
                        ) : null}
                        submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
