import React from "react";
import { Button, Modal } from "react-bootstrap";
import { BsInfoCircle } from "react-icons/bs";
import { ApplicantPill } from "./drag-and-drop-interface/ApplicantPill";

const EXAMPLE_APPLICATION = {
    id: 0,
    comments: null,
    program: "U",
    department: "math",
    previous_experience_summary: null,
    previous_department_ta: false,
    previous_university_ta: false,
    yip: 6,
    gpa: 3.3,
    custom_question_answers: {},
    annotation: null,
    documents: [],
    submission_date: "2025-12-12T14:50:26.225-05:00",
    applicant: {} as any,
    posting: null,
    position_preferences: [],
    instructor_preferences: [],
};
const EXAMPLE_APPLICANT = {
    utorid: "xxxxx",
    email: "",
    first_name: "Tom",
    last_name: "Smith",
    id: 0,
    phone: "",
    student_number: "",
};

/**
 * Open a dialog to set additional data for draft matching. This includes
 * a show list, a hide list, and subsequent appointment data (i.e. hour ranges).
 */
export function AboutDialogButton() {
    const [showDialog, setShowDialog] = React.useState(false);

    return (
        <>
            <Modal
                show={showDialog}
                onHide={() => setShowDialog(false)}
                size="xl"
                className="additional-data-dialog"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>About</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflowY: "auto" }}>
                    <p>
                        Drag and drop applicants to create draft assignments.
                        These assignments exist only on your computer{" "}
                        <b>
                            and will not be sent to TAPP until the Finalize
                            button is used
                        </b>
                        . Once clicked, the Finalize button will allow you to
                        review all the draft changes and save them to TAPP.
                    </p>
                    <p>
                        When an applicant is dragged, their preferences are
                        highlighted in the position list.
                    </p>
                    <table>
                        <thead>
                            <tr>
                                <th>Visual</th>
                                <th>Meaning</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <span className="draft-matching-panel-group ">
                                        <span className="applicant-pill ">
                                            <span className=" preference-level grid-detail-small level--1">
                                                -
                                            </span>
                                            <span className=" preference-level grid-detail-small level-0"></span>
                                            <span className=" preference-level grid-detail-small level-1">
                                                +
                                            </span>
                                            <span className=" preference-level grid-detail-small level-2">
                                                ++
                                            </span>
                                            <span className=" preference-level grid-detail-small level-3">
                                                +++
                                            </span>
                                        </span>
                                    </span>
                                </td>
                                <td>
                                    The candidates level of interest in the
                                    currently selected position.
                                </td>
                            </tr>
                            <tr>
                                <td className="draft-matching-panel-group">
                                    <ApplicantPill
                                        applicant={EXAMPLE_APPLICANT}
                                        parent={{ source: "applicant-list" }}
                                        application={EXAMPLE_APPLICATION}
                                        additionalInfo={{}}
                                    />
                                </td>
                                <td>
                                    Tom Smith has a utorid of <b>xxxxx</b>. They
                                    are in the <b>M</b>ath department, who is a{" "}
                                    <b>6</b>th year Undergraduate and who is a{" "}
                                    <b>New</b> TA. They are currently assigned{" "}
                                    <b>0</b> hours and have no minimum hours
                                    requirement.
                                </td>
                            </tr>
                            <tr>
                                <td className="draft-matching-panel-group">
                                    <ApplicantPill
                                        applicant={EXAMPLE_APPLICANT}
                                        parent={{ source: "applicant-list" }}
                                        application={{
                                            ...EXAMPLE_APPLICATION,
                                            previous_department_ta: true,
                                        }}
                                        additionalInfo={{}}
                                    />
                                </td>
                                <td>
                                    Tom Smith has been a TA for the department
                                    before.
                                </td>
                            </tr>
                            <tr>
                                <td className="draft-matching-panel-group">
                                    <ApplicantPill
                                        applicant={EXAMPLE_APPLICANT}
                                        parent={{ source: "applicant-list" }}
                                        application={{
                                            ...EXAMPLE_APPLICATION,
                                            previous_university_ta: true,
                                        }}
                                        additionalInfo={{}}
                                    />
                                </td>
                                <td>
                                    Tom Smith has been a TA for the university
                                    before but not for this department.
                                </td>
                            </tr>
                            <tr>
                                <td className="draft-matching-panel-group">
                                    <ApplicantPill
                                        applicant={EXAMPLE_APPLICANT}
                                        parent={{ source: "applicant-list" }}
                                        application={EXAMPLE_APPLICATION}
                                        additionalInfo={{
                                            minHours: 50,
                                            maxHours: 200,
                                        }}
                                    />
                                </td>
                                <td>
                                    Tom Smith has a minimum hours requirement of{" "}
                                    <b>50</b> hours and a maximum hours
                                    requirement of <b>200</b> hours. Their hours
                                    are currently unfulfilled.
                                </td>
                            </tr>
                            <tr>
                                <td className="draft-matching-panel-group">
                                    <ApplicantPill
                                        allAssignments={[
                                            {
                                                hours: 100,
                                                position: {
                                                    position_code: "MAT223",
                                                    position_title:
                                                        "Linear Algebra I",
                                                },
                                            } as any,
                                        ]}
                                        applicant={EXAMPLE_APPLICANT}
                                        parent={{ source: "applicant-list" }}
                                        application={EXAMPLE_APPLICATION}
                                        additionalInfo={{
                                            minHours: 50,
                                            maxHours: 200,
                                        }}
                                    />
                                </td>
                                <td>
                                    Tom Smith has <b>100</b> hours assigned
                                    which meets their requirement.
                                </td>
                            </tr>
                            <tr>
                                <td className="draft-matching-panel-group">
                                    <ApplicantPill
                                        allAssignments={[
                                            {
                                                hours: 300,
                                                position: {
                                                    position_code: "MAT223",
                                                    position_title:
                                                        "Linear Algebra I",
                                                },
                                            } as any,
                                        ]}
                                        applicant={EXAMPLE_APPLICANT}
                                        parent={{ source: "applicant-list" }}
                                        application={EXAMPLE_APPLICATION}
                                        additionalInfo={{
                                            minHours: 50,
                                            maxHours: 200,
                                        }}
                                    />
                                </td>
                                <td>
                                    Tom Smith has <b>300</b> hours assigned
                                    which exceeds their requirement.
                                </td>
                            </tr>
                            <tr>
                                <td className="draft-matching-panel-group">
                                    <ApplicantPill
                                        allAssignments={[
                                            {
                                                hours: 40,
                                                position: {
                                                    position_code: "MAT223",
                                                    position_title:
                                                        "Linear Algebra I",
                                                },
                                            } as any,
                                        ]}
                                        assignment={
                                            {
                                                hours: 40,
                                            } as any
                                        }
                                        applicant={EXAMPLE_APPLICANT}
                                        parent={{ source: "applicant-list" }}
                                        application={EXAMPLE_APPLICATION}
                                        additionalInfo={{
                                            minHours: 50,
                                            maxHours: 200,
                                        }}
                                    />
                                </td>
                                <td>
                                    Tom Smith has{" "}
                                    <b>
                                        a contract associated with this
                                        assignment
                                    </b>
                                    . That means that the assignment cannot be
                                    changed until the contract is withdrawn.
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {[-1, 0, 1, 2, 3].map((level) => (
                                        <div
                                            key={level}
                                            className="draft-matching-panel-group"
                                            style={{ display: "inline-block" }}
                                        >
                                            <div className="assignments-table">
                                                <div
                                                    className={`position level level-${level}`}
                                                    style={{
                                                        width: 30,
                                                        height: 40,
                                                    }}
                                                >
                                                    {level}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    Applicant has indicated a preference of
                                    -1/0/1/2/3 (3 = highest) for this position.
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {[-1, 0, 1, 2, 3].map((level) => (
                                        <div
                                            key={level}
                                            className="draft-matching-panel-group"
                                            style={{ display: "inline-block" }}
                                        >
                                            <div className="assignments-table">
                                                <div
                                                    className={`position level level-${level} already-assigned`}
                                                    style={{
                                                        width: 30,
                                                        height: 40,
                                                    }}
                                                >
                                                    {level}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    Applicant has indicated a preference for
                                    this position but is <b>already assigned</b>{" "}
                                    to the position.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDialog(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Button
                variant="outline-secondary"
                onClick={() => setShowDialog(true)}
                title="View details about the matching interface and how to use it"
            >
                <BsInfoCircle /> About
            </Button>
        </>
    );
}
