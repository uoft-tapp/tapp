import { normalizeImport } from "../../libs/import-export";
import {
    instructorsSelector,
    upsertApplicant,
    upsertAssignment,
    upsertPosition,
    upsertSession,
    upsertInstructor,
    upsertContractTemplate,
    fetchSessions,
    setActiveSession,
} from "../../api/actions";

import {
    positionSchema,
    applicantSchema,
    assignmentSchema,
} from "../../libs/schema";
import React from "react";
import { useSelector } from "react-redux";
import { Button, Modal, ProgressBar } from "react-bootstrap";
import mockSessionData from "../../mock_data/session.json";
import mockContractTemplate from "../../mock_data/contract_template.json";
import mockInstructors from "../../mock_data/instructor.json";
import mockApplicantData from "../../mock_data/applicant.json";
import mockPositionData from "../../mock_data/position.json";
import mockAssignmentData from "../../mock_data/assignment.json";
import { useThunkDispatch } from "../../libs/thunk-dispatch";
import { prepareFull } from "../../libs/import-export";

/**
 * A button to automatically set up a mock session with contract_template and
 * instructors, and upsert positions, applicants, and assignments from mock data
 * JSON files in order.
 *
 * This component only renders when `process.env.REACT_APP_DEV_FEATURES` is truthy.
 *
 * @export
 * @returns {React.ElementType}
 */
function LoadMockButton() {
    const [disable, setDisable] = React.useState(false);
    const [inProgress, setInProgress] = React.useState(false);
    const [stage, setStage] = React.useState("");
    const [now, setNow] = React.useState(0);
    const dispatch = useThunkDispatch();
    const instructors = useSelector(instructorsSelector);
    let session;
    let contractTemplates = [];
    let positions = [];
    let applicants = [];
    let count;
    let total;

    async function setupMockSession() {
        try {
            setStage("Session");

            // create the mock session
            session = await dispatch(upsertSession(mockSessionData));
            await dispatch(setActiveSession(session));

            setStage("Contract Template");
            const currContractTemplate = await dispatch(
                upsertContractTemplate(mockContractTemplate)
            );
            contractTemplates.push(currContractTemplate);
            setNow(50);
            // upsert any missing instructors
            setStage("Instructors");
            for (let instructor of mockInstructors) {
                if (!instructors.some((i) => i.utorid === instructor.utorid)) {
                    const newInstructor = await dispatch(
                        upsertInstructor(instructor)
                    );
                    instructors.push(newInstructor);
                }
            }
            setNow(100);
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async function setupMockPositions() {
        try {
            setStage("Positions");
            setNow(0);
            count = 0;
            total = mockPositionData.length;
            const data = normalizeImport(
                {
                    fileType: "json",
                    data: mockPositionData,
                },
                positionSchema
            ).map((p) =>
                prepareFull.position(p, {
                    instructors,
                    contractTemplates,
                })
            );
            for (let p of data) {
                const position = await dispatch(upsertPosition(p));
                positions.push(position);
                count++;
                setNow(Math.round((count / total) * 100));
            }
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async function setupMockApplicants() {
        try {
            setStage("Applicants");
            setNow(0);
            count = 0;
            total = mockApplicantData.length;
            const data = normalizeImport(
                {
                    fileType: "json",
                    data: mockApplicantData,
                },
                applicantSchema
            );
            for (let a of data) {
                const applicant = await dispatch(upsertApplicant(a));
                applicants.push(applicant);
                count++;
                setNow(Math.round((count / total) * 100));
            }
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async function setupMockAssignments() {
        try {
            setStage("Assignments");
            setNow(0);
            count = 0;
            total = mockAssignmentData.length;
            const data = normalizeImport(
                {
                    fileType: "json",
                    data: mockAssignmentData,
                },
                assignmentSchema
            ).map((p) =>
                prepareFull.assignment(p, {
                    positions,
                    applicants,
                    session,
                })
            );
            for (let a of data) {
                await dispatch(upsertAssignment(a));
                count++;
                setNow(Math.round((count / total) * 100));
            }
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async function clickHandler() {
        try {
            const sessions = await dispatch(fetchSessions());
            if (sessions.some((s) => s.name === mockSessionData.name)) {
                setDisable(true);
                return;
            }
            setInProgress(true);
            await setupMockSession();
            await setupMockPositions();
            await setupMockApplicants();
            await setupMockAssignments();
            setInProgress(false);
        } catch (error) {
            setInProgress(false);
            return;
        }
    }

    return (
        <span
            title={"One-click loads all mock data JSON files"}
            className="mock-button"
        >
            <Button onClick={clickHandler}>Load Mock</Button>
            <Modal show={disable} onHide={() => setDisable(false)} size="md">
                <Modal.Header closeButton>
                    <Modal.Title>{"Mock session already exists"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {"Please delete the mock session first before reloading."}
                </Modal.Body>
            </Modal>
            <Modal show={inProgress} size="md">
                <Modal.Header>
                    <Modal.Title>{`Upserting mock ${stage}`}</Modal.Title>
                </Modal.Header>

                <Modal.Body
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ProgressBar
                        now={now}
                        label={`${now}%`}
                        style={{ minWidth: "90%" }}
                    />
                </Modal.Body>
            </Modal>
        </span>
    );
}

export { LoadMockButton };
