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
    positionsSelector,
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
import {
    Applicant,
    ContractTemplate,
    MinimalAssignment,
    MinimalPosition,
    Session,
} from "../../api/defs/types";

const ident = () => {};

/**
 * A button to automatically set up a mock session with contract_template and
 * instructors, and upsert positions, applicants, and assignments from mock data
 * JSON files in order.
 */
export function SeedDataMenu({
    sessions = [],
    fetchSessions = ident,
}: {
    sessions?: Session[];
    fetchSessions: Function;
}) {
    const [targetSession, setTargetSession] = React.useState<Session | null>(
        null
    );
    const [dropdownVisible, setDropdownVisible] = React.useState(false);
    const [confirm, setConfirm] = React.useState(false);
    const [inProgress, setInProgress] = React.useState(false);
    const [stage, setStage] = React.useState("");
    const [progress, setProgress] = React.useState(0);
    const dispatch = useThunkDispatch();
    const instructors = useSelector(instructorsSelector);
    let session: Session | null;
    let contractTemplates: ContractTemplate[] = [];
    let positions = useSelector(positionsSelector);
    let applicants: Applicant[] = [];
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

    async function loadSession() {
        setStage("Session");
        setProgress(0);

        if (targetSession === null) {
            // create the mock session
            const mockSessionData = {
                start_date: "2020/01/01",
                end_date: "2021/12/31",
                name: `Session ${new Date().toLocaleString()}`,
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

    async function loadContractTemplate() {
        setProgress(0);
        setStage("Contract Template");
        const contractTemplate = await dispatch(
            upsertContractTemplate(mockContractTemplate)
        );
        contractTemplates.push(contractTemplate);
        setProgress(100);
    }

    async function loadInstructors(limit = 1000) {
        setStage("Instructors");
        setProgress(0);
        for (let instructor of mockInstructors.slice(0, limit)) {
            if (
                !instructors.some((inst) => inst.utorid === instructor.utorid)
            ) {
                const newInstructor = await dispatch(
                    upsertInstructor(instructor)
                );
                instructors.push(newInstructor);
            }
        }
        setProgress(100);
    }

    async function loadPositions(limit = 1000) {
        setStage("Positions");
        setProgress(0);
        count = 0;
        total = mockPositionData.length;
        const data = (normalizeImport(
            {
                fileType: "json",
                data: mockPositionData,
            },
            positionSchema
        ) as MinimalPosition[]).map((position) =>
            prepareFull.position(position, {
                instructors,
                contractTemplates,
            })
        );
        for (const position of data.slice(0, limit)) {
            await dispatch(upsertPosition(position));
            count++;
            setProgress(Math.round((count / total) * 100));
        }
    }

    async function loadApplicants(limit = 1000) {
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
        for (const a of data.slice(0, limit)) {
            const applicant = await dispatch(upsertApplicant(a));
            applicants.push(applicant);
            count++;
            setProgress(Math.round((count / total) * 100));
        }
    }

    async function loadAssignments(limit = 1000) {
        setStage("Assignments");
        setProgress(0);
        if (!session) {
            throw new Error("Need a valid session to continue");
        }
        count = 0;
        total = mockAssignmentData.length;
        const data = (normalizeImport(
            {
                fileType: "json",
                data: mockAssignmentData,
            },
            assignmentSchema
        ) as MinimalAssignment[]).map((assignment) => {
            if (!session) {
                throw new Error("Need a valid session to continue");
            }
            return prepareFull.assignment(assignment, {
                positions,
                applicants,
                session,
            });
        });
        for (const a of data.slice(0, limit)) {
            await dispatch(upsertAssignment(a));
            count++;
            setProgress(Math.round((count / total) * 100));
        }
    }

    async function loadAll() {
        try {
            setConfirm(false);
            setInProgress(true);

            await loadSession();
            await loadContractTemplate();
            await loadInstructors();
            await loadPositions();
            await loadApplicants();
            await loadAssignments();
        } catch (error) {
            console.error(error);
        } finally {
            setInProgress(false);
            setTargetSession(null);
        }
    }

    function onSelectHandler(i: string | null) {
        if (i !== "new") {
            setTargetSession(sessions[i as any]);
        }
        setConfirm(true);
    }

    return (
        <span
            title="Load seed data. If a new session is not specified, the active session is used."
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
                    Seed Data{" "}
                </Dropdown.Toggle>
                <Dropdown.Menu flip={true}>
                    <Dropdown.Header>
                        {sessions.length
                            ? "Load to existing sessions"
                            : "No existing sessions"}
                    </Dropdown.Header>
                    {(sessions || []).map((session, i) => (
                        <Dropdown.Item key={i} eventKey={"" + i}>
                            {session.name}
                        </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="new">
                        Create New Session
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            <Modal
                show={confirm}
                onHide={() => {
                    setConfirm(false);
                    setTargetSession(null);
                }}
                size="lg"
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
                    <Button variant="primary" onClick={loadAll}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={inProgress} size="lg">
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
