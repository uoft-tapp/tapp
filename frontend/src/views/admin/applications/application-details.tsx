import React from "react";
import { Badge, Button } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { Application } from "../../../api/defs/types";
import * as Survey from "survey-react";
import "./application-details.css";

interface SurveyJsPage {
    name: string;
    elements: { name: string; type: string }[];
}

/**
 * Strip any SurveyJs questions of type `html` from the question list.
 * `html` questions are just descriptions without answers, so we
 * normally don't show them.
 *
 * @param {*} custom_questions
 * @returns
 */
function removeHtmlQuestions(custom_questions: any) {
    if (!Array.isArray(custom_questions.pages)) {
        return custom_questions;
    }
    const pages: SurveyJsPage[] = custom_questions.pages;
    const filteredPages = pages.map((page) => ({
        ...page,
        elements: page.elements.filter((elm) => elm.type !== "html"),
    }));

    return { ...custom_questions, pages: filteredPages };
}

const PREFERENCE_LEVEL_TO_VARIANT: Record<number | string, string> = {
    3: "success",
    2: "primary",
    1: "warning",
    "-1": "secondary",
};

export function ApplicationDetails({
    application,
}: {
    application: Application;
}) {
    const survey = React.useMemo(() => {
        const posting = application.posting || { custom_questions: {} };
        if (!posting.custom_questions) {
            return null;
        }

        Survey.StylesManager.applyTheme("bootstrap");
        Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
        const survey = new Survey.Model(
            // HTML questions are informational for survey takers. We don't need them when viewing survey responses
            removeHtmlQuestions(posting.custom_questions)
        );
        survey.showPreviewBeforeComplete = "showAnsweredQuestions";
        survey.showQuestionNumbers = "off";
        survey.questionsOnPageMode = "singlePage";
        survey.mode = "display";

        // The utorid is auto-filled when the user is actually taking a survey.
        survey.data = application.custom_question_answers;

        return survey;
    }, [application]);

    return (
        <React.Fragment>
            <table className="application-details-table">
                <tbody>
                    <tr>
                        <th>First Name</th>
                        <td>{application.applicant.first_name}</td>
                    </tr>
                    <tr>
                        <th>Last Name</th>
                        <td>{application.applicant.last_name}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>{application.applicant.email}</td>
                    </tr>
                    <tr>
                        <th>UTORid</th>
                        <td>{application.applicant.utorid}</td>
                    </tr>
                    <tr>
                        <th>Student Number</th>
                        <td>{application.applicant.student_number}</td>
                    </tr>
                    <tr>
                        <th>Phone</th>
                        <td>{application.applicant.phone}</td>
                    </tr>
                    <tr>
                        <th>Department</th>
                        <td>{application.department}</td>
                    </tr>
                    <tr>
                        <th>Program</th>
                        <td>{application.program}</td>
                    </tr>
                    <tr>
                        <th>Year in Progress</th>
                        <td>{application.yip}</td>
                    </tr>
                    <tr>
                        <th>Previous Experience</th>
                        <td>
                            {application.previous_department_ta != null
                                ? application.previous_department_ta === true
                                    ? "TAed for department; "
                                    : "Has not TAed for department; "
                                : null}
                            {application.previous_university_ta != null
                                ? application.previous_university_ta === true
                                    ? "TAed for university; "
                                    : "Has not TAed at this university; "
                                : null}
                            {application.previous_experience_summary
                                ? `Experience Summary: ${application.previous_experience_summary}`
                                : null}
                        </td>
                    </tr>
                    <tr>
                        <th>Positions Applied For</th>
                        <td>
                            <ul className="position-preferences-list">
                                {application.position_preferences
                                    .filter(
                                        (position_preference) =>
                                            position_preference.preference_level !==
                                            0
                                    )
                                    .map((position_preference) => (
                                        <Badge
                                            as="li"
                                            key={
                                                position_preference.position
                                                    .position_code
                                            }
                                            variant={
                                                PREFERENCE_LEVEL_TO_VARIANT[
                                                    position_preference
                                                        .preference_level
                                                ] || "info"
                                            }
                                        >
                                            {
                                                position_preference.position
                                                    .position_code
                                            }{" "}
                                            (
                                            {
                                                position_preference.preference_level
                                            }
                                            )
                                        </Badge>
                                    ))}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th>Supporting Documents</th>
                        <td>
                            {application.documents.map((document) => (
                                <Button
                                    key={document.name}
                                    href={`/public/files/${document.url_token}`}
                                    title={`Download ${
                                        document.name
                                    } (${Math.round(document.size / 1024)} kb)`}
                                    size="sm"
                                    variant="light"
                                    className="mr-2"
                                >
                                    <FaDownload className="mr-2" />
                                    {document.name}
                                </Button>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <th>Additional Comments</th>
                        <td>{application.comments}</td>
                    </tr>
                    {application.posting?.custom_questions && (
                        <tr className="custom-questions-row">
                            <th>Custom Questions</th>
                            <td>
                                {survey && <Survey.Survey model={survey} />}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </React.Fragment>
    );
}
