import { normalizeImport } from "../../libs/import-export";
import {
    instructorsSelector,
    upsertApplicant,
    upsertAssignment,
    upsertPosition,
    upsertSession,
    upsertInstructor,
    upsertContractTemplate,
    setActiveSession,
} from "../../api/actions";

import {
    positionSchema,
    applicantSchema,
    assignmentSchema,
} from "../../libs/schema";
import React from "react";
import { useSelector } from "react-redux";
import { Button, Modal, ProgressBar, Dropdown } from "react-bootstrap";
import mockContractTemplate from "../../mock_data/contract_template.json";
import mockInstructors from "../../mock_data/instructor.json";
import mockApplicantData from "../../mock_data/applicant.json";
import mockPositionData from "../../mock_data/position.json";
import mockAssignmentData from "../../mock_data/assignment.json";
import { useThunkDispatch } from "../../libs/thunk-dispatch";
import { prepareFull } from "../../libs/import-export";

const ident = () => {};

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
function LoadMockButton({ sessions = [], fetchSessions = ident }) {
    const [targetSession, setTargetSession] = React.useState(null);
    const [dropdownVisible, setDropdownVisible] = React.useState(false);
    const [confirm, setConfirm] = React.useState(false);
    const [inProgress, setInProgress] = React.useState(false);
    const [stage, setStage] = React.useState("");
    const [progress, setProgress] = React.useState(0);
    const dispatch = useThunkDispatch();
    const instructors = useSelector(instructorsSelector);
    let session;
    let contractTemplates = [];
    let positions = [];
    let applicants = [];
    let count;
    let total;

    React.useEffect(() => {
        // Whenever the dropdown is open, fetch a list of all existing sessions.
        // This would normally not be a good idea, but since this button is only
        // used in debug mode, it's okay.
        if (dropdownVisible) {
            fetchSessions();
        }
    }, [dropdownVisible, fetchSessions]);

    async function setupMockSession() {
        setStage("Session");
        setProgress(0);

        if (targetSession === null) {
            // create the mock session
            const mockSessionData = {
                start_date: "2020/01/01",
                end_date: "2021/12/31",
                name: new Date().toLocaleString(),
                rate1: 50,
            };
            session = await dispatch(upsertSession(mockSessionData));
        } else {
            // use the selected session
            session = targetSession;
        }

        await dispatch(setActiveSession(session));

        setProgress(100);
    }

    async function setupMockContractTemplate() {
        setProgress(0);
        setStage("Contract Template");
        const contractTemplate = await dispatch(
            upsertContractTemplate(mockContractTemplate)
        );
        contractTemplates.push(contractTemplate);
        setProgress(100);
    }

    async function setupMockInstructors() {
        setStage("Instructors");
        setProgress(0);
        for (let instructor of mockInstructors) {
            if (!instructors.some((i) => i.utorid === instructor.utorid)) {
                const newInstructor = await dispatch(
                    upsertInstructor(instructor)
                );
                instructors.push(newInstructor);
            }
        }
        setProgress(100);
    }

    async function setupMockPositions() {
        setStage("Positions");
        setProgress(0);
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
        for (const p of data) {
            const position = await dispatch(upsertPosition(p));
            positions.push(position);
            count++;
            setProgress(Math.round((count / total) * 100));
        }
    }

    async function setupMockApplicants() {
        setStage("Applicants");
        setProgress(0);
        count = 0;
        total = mockApplicantData.length;
        const data = normalizeImport(
            {
                fileType: "json",
                data: mockApplicantData,
            },
            applicantSchema
        );
        for (const a of data) {
            const applicant = await dispatch(upsertApplicant(a));
            applicants.push(applicant);
            count++;
            setProgress(Math.round((count / total) * 100));
        }
    }

    async function setupMockAssignments() {
        setStage("Assignments");
        setProgress(0);
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
        for (const a of data) {
            await dispatch(upsertAssignment(a));
            count++;
            setProgress(Math.round((count / total) * 100));
        }
    }

    async function loadMock() {
        try {
            setConfirm(false);
            setInProgress(true);

            await setupMockSession();
            await setupMockContractTemplate();
            await setupMockInstructors();
            await setupMockPositions();
            await setupMockApplicants();
            await setupMockAssignments();
        } catch (error) {
            console.error(error);
        } finally {
            setInProgress(false);
            setTargetSession(null);
        }
    }

    function onSelectHandler(i) {
        if (i !== "new") {
            setTargetSession(sessions[i]);
        }
        setConfirm(true);
    }

    return (
        <span
            title="Set which session you are loading the mock data into. Otherwise it creates a new session to load."
            className="mock-button"
        >
            <Dropdown
                onSelect={onSelectHandler}
                onToggle={(desiredVisibility) =>
                    setDropdownVisible(desiredVisibility)
                }
                show={dropdownVisible}
                alignRight
            >
                <Dropdown.Toggle split variant="dark">
                    Load Mock
                </Dropdown.Toggle>
                <Dropdown.Menu flip={true}>
                    <Dropdown.Header>
                        {sessions.length
                            ? "Load to existing sessions"
                            : "No existing sessions"}
                    </Dropdown.Header>
                    {(sessions || []).map((session, i) => (
                        <Dropdown.Item key={i} eventKey={i}>
                            {session.name}
                        </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="new"> Create New</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            <Modal
                show={confirm}
                onHide={() => {
                    setConfirm(false);
                    setTargetSession(null);
                }}
                size="md"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Loading Mock</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {targetSession === null
                        ? "Are you sure to create a new session and load mock data?"
                        : `Are you sure to load mock data into ${targetSession.name}?`}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setConfirm(false);
                            setTargetSession(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={loadMock}>
                        Confirm
                    </Button>
                </Modal.Footer>
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
                        now={progress}
                        label={`${progress}%`}
                        style={{ minWidth: "90%" }}
                    />
                </Modal.Body>
            </Modal>
        </span>
    );
}

export { LoadMockButton };
