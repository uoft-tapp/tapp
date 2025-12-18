import React from "react";
import { useParams } from "react-router-dom";
import { apiGET, apiPOST } from "../../../libs/api-utils";
import 'survey-core/survey-core.css';
import * as Survey from "survey-react-ui";
import "./survey.css";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";

/**
 * Determine whether a survey.js survey has has at least one
 * position preference available. (Surveys that don't have any position
 * preferences available to be selected are considered invalid.)
 *
 * @param {*} surveyJson
 * @returns {boolean}
 */
function validSurvey(surveyJson: any): boolean {
    for (const page of surveyJson?.pages || []) {
        for (const item of page?.elements || []) {
            if (
                item.name === "position_preferences" &&
                item?.rows?.length > 0
            ) {
                return true;
            }
        }
    }
    return false;
}

function ConfirmDialog({
    submitDialogVisible,
    hideDialogAndResetData,
    applicationOpen,
    submissionError,
    confirmClicked,
    waiting,
}: {
    submitDialogVisible: boolean;
    hideDialogAndResetData: (...args: any[]) => any;
    applicationOpen: boolean;
    submissionError: string | null;
    confirmClicked: (...args: any[]) => any;
    waiting: boolean;
}) {
    const [sessionTimeout, setSessionTimeout] = React.useState(false);
    React.useEffect(() => {
        // If it takes a long time for the user to fill out the posting, their shibboleth
        // session might have timed out. To test for this, we make a dummy call to the backed right
        // when the confirm dialog becomes visible. If the call fails, it means the session has timed out.
        if (submitDialogVisible) {
            apiGET(`/active_user`)
                .then((resp: any) => {
                    if (!resp.utorid) {
                        throw new Error(
                            "Failed to get an authenticated response from the server"
                        );
                    }
                })
                .catch(() => {
                    setSessionTimeout(true);
                });
        } else {
            setSessionTimeout(false);
        }
    }, [submitDialogVisible, setSessionTimeout]);

    return (
        <Modal show={submitDialogVisible} onHide={hideDialogAndResetData}>
            <Modal.Header closeButton>
                <Modal.Title>Submit Application</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!applicationOpen ? (
                    <Alert variant="warning">
                        The application window is currently not open. Any
                        applications submitted outside of the application window
                        may not be considered.
                    </Alert>
                ) : null}
                {sessionTimeout && (
                    <Alert variant="danger">
                        <b>Error:</b> Your session has timed out. Please refresh
                        the browser and try again. (Your answers have not been
                        saved, but you may copy-and-paste them to another
                        document before refreshing.)
                    </Alert>
                )}
                {submissionError ? (
                    <Alert variant="danger">
                        <b>Error:</b> {submissionError} Please review your
                        answers and make sure all questions are answered
                        appropriately.
                        <p className="mb-1">
                            If all your answers look correct, try
                        </p>
                        <ul className="mt-1">
                            <li>
                                Refreshing the browser and trying to submit
                                again.
                            </li>
                            <li>
                                Submitting your application via Firefox or
                                Chrome.
                            </li>
                        </ul>
                    </Alert>
                ) : (
                    "Are you sure you want to submit this TA application?"
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hideDialogAndResetData}>
                    Cancel
                </Button>
                <Button onClick={confirmClicked} disabled={!!submissionError}>
                    {waiting ? (
                        <span className="spinner-surround">
                            <Spinner animation="border" size="sm" />
                        </span>
                    ) : null}
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function PostingView() {
    const params = useParams<{ url_token?: string } | null>();
    const url_token = params?.url_token;
    const [surveyJson, setSurveyJson] = React.useState<any>(null);
    const [surveyPrefilledData, setSurveyPrefilledData] =
        React.useState<any>(null);
    const [surveyData, setSurveyData] = React.useState<any>(null);
    const [submitDialogVisible, setSubmitDialogVisible] = React.useState(false);
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const [waiting, setWaiting] = React.useState(false);
    const [submissionError, setSubmissionError] = React.useState<string | null>(
        null
    );
    const [applicationOpen, setApplicationOpen] = React.useState(true);

    React.useEffect(() => {
        if (url_token == null) {
            return;
        }
        async function fetchSurvey() {
            try {
                const details: {
                    survey: any;
                    prefilled_data: any;
                    open_status: boolean;
                } = await apiGET(`/public/postings/${url_token}`, true);
                setSurveyJson(details.survey);
                setSurveyPrefilledData(details.prefilled_data);
                setApplicationOpen(details.open_status);
            } catch (e) {
                console.warn(e);
            }
        }
        fetchSurvey();
    }, [url_token, setSurveyJson, setSurveyPrefilledData, setApplicationOpen]);

    const survey = React.useMemo(() => {
        const survey = new Survey.Model(surveyJson);
        survey.showPreviewBeforeComplete = "showAnsweredQuestions";
        survey.showQuestionNumbers = "off";
        survey.showProgressBar = "bottom";

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
        survey.onCompleting.add(
            (
                result,
                options
            ) => {
                if (!hasSubmitted) {
                    options.allow = false;
                    setSurveyData(result.data);
                    setSubmitDialogVisible(true);
                    setTimeout(() => survey.showPreview(), 0);
                }
            }
        );
    }, [survey, setSurveyData, setSubmitDialogVisible, hasSubmitted]);

    if (url_token == null) {
        return <React.Fragment>Unknown URL token.</React.Fragment>;
    }

    if (surveyJson == null || surveyPrefilledData == null) {
        return <React.Fragment>Loading...</React.Fragment>;
    }

    if (!validSurvey(surveyJson)) {
        return (
            <Alert variant="warning">
                There are not positions that can be applied for at this time. An
                administrator may update this posting in the future.
            </Alert>
        );
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
            setSubmissionError(null);
        } catch (e) {
            console.warn(e);
            setSubmissionError("Could not submit application.");
        } finally {
            setWaiting(false);
        }
    }

    function hideDialogAndResetData() {
        survey.data = surveyData || survey.data;
        setHasSubmitted(false);
        setSubmitDialogVisible(false);
        setSubmissionError(null);
    }

    return (
        <React.Fragment>
            <Survey.Survey model={survey} />
            <ConfirmDialog
                submitDialogVisible={submitDialogVisible}
                hideDialogAndResetData={hideDialogAndResetData}
                applicationOpen={applicationOpen}
                submissionError={submissionError}
                confirmClicked={confirmClicked}
                waiting={waiting}
            />
        </React.Fragment>
    );
}
