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
    applicantsSelector,
    activeSessionSelector,
    debugOnlyUpsertUser,
    contractTemplatesSelector,
} from "../../api/actions";

import {
    positionSchema,
    applicantSchema,
    assignmentSchema,
} from "../../libs/schema";
import React from "react";
import { useSelector } from "react-redux";
import { Button, Modal, ProgressBar, Dropdown } from "react-bootstrap";
import { useThunkDispatch } from "../../libs/thunk-dispatch";
import { prepareFull } from "../../libs/import-export";
import {
    MinimalAssignment,
    MinimalPosition,
    Session,
} from "../../api/defs/types";
import { seedData } from "../../mock_data";

type PromiseOrVoidFunction = (...args: any[]) => Promise<any> | void;

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
    const [dropdownVisible, setDropdownVisible] = React.useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(
        false
    );
    const [seedAction, _setSeedAction] = React.useState<PromiseOrVoidFunction>(
        () => ident
    );
    const [inProgress, setInProgress] = React.useState(false);
    const [stage, setStage] = React.useState("");
    const [progress, setProgress] = React.useState(0);
    const dispatch = useThunkDispatch();
    const instructors = useSelector(instructorsSelector);
    const targetSession = useSelector(activeSessionSelector);
    const contractTemplates = useSelector(contractTemplatesSelector);
    let positions = useSelector(positionsSelector);
    let applicants = useSelector(applicantsSelector);

    // If a function is passed to a `useSate` setter, it is evaluated.
    // Since we want to set the state to a function, we need to wrap the setter,
    // so that it does the right thing.
    function setSeedAction(action: PromiseOrVoidFunction) {
        _setSeedAction(() => action);
    }

    const seedActions = {
        user: { name: `Users (${seedData.users.length})`, action: seedUsers },
        session: { name: "Session (1)", action: seedSession },
        contractTemplate: {
            name: "Contract Templates (2)",
            action: seedContractTemplate,
        },
        instructors10: {
            name: "Instructors (10)",
            action: () => seedInstructors(10),
        },
        instructors: {
            name: `Instructors (${seedData.instructors.length})`,
            action: seedInstructors,
        },
        position10: { name: "Positions (10)", action: () => seedPositions(10) },
        position: {
            name: `Positions (${seedData.positions.length})`,
            action: seedPositions,
        },
        applicant10: {
            name: "Applicants (10)",
            action: () => seedApplicants(10),
        },
        applicant: {
            name: `Applicants (${seedData.applicants.length})`,
            action: seedApplicants,
        },
        assignment10: {
            name: "Assignments (10)",
            action: () => seedAssignments(10),
        },
        assignment: {
            name: `Assignment (${seedData.assignments.length})`,
            action: seedAssignments,
        },
        all: { name: "All Data", action: seedAll },
    };

    React.useEffect(() => {
        // Whenever the dropdown is open, fetch a list of all existing sessions.
        // This would normally not be a good idea, but since this button is only
        // used in debug mode, it's okay.
        if (dropdownVisible) {
            fetchSessions();
        }
    }, [dropdownVisible, fetchSessions]);

    async function progressDispatch(
        dispatchAction: Function,
        dispatchArray: any[],
        batchSize: number,
        progressCallback: (a: number) => void
    ) {
        const total = dispatchArray.length;
        let curr = 0;
        while (curr < total) {
            await Promise.all(
                dispatchArray
                    .slice(curr, curr + batchSize)
                    .map(async (e: any) => {
                        await dispatch(dispatchAction(e));
                    })
            );
            progressCallback(((curr + batchSize) / total) * 100);
            curr += batchSize;
        }
    }

    async function seedSession() {
        setStage("Session");
        setProgress(0);

        if (targetSession === null) {
            // no active session, create the mock session
            const mockSessionData = {
                start_date: "2020/01/01",
                end_date: "2021/12/31",
                name: `Session ${new Date().toLocaleString()}`,
                rate1: 50,
            };
            const currSession = await dispatch(upsertSession(mockSessionData));
            await dispatch(setActiveSession(currSession));
        } else {
            // already exist active session, maybe add another session?
        }

        setProgress(100);
    }

    async function seedUsers(limit = 1000) {
        setProgress(0);
        setStage("Users");
		const users = seedData.users.slice(0, limit);
		await progressDispatch(debugOnlyUpsertUser, users, 10, setProgress);
    }

    async function seedContractTemplate() {
        setStage("Contract Template");
        setProgress(0);
        for (const contractTemplate of seedData.contractTemplates) {
            const newContractTemplate = await dispatch(
                upsertContractTemplate(contractTemplate)
            );
            contractTemplates.push(newContractTemplate);
        }

        setProgress(100);
    }

    async function seedInstructors(limit = 1000) {
        setStage("Instructors");
        setProgress(0);
        for (let instructor of seedData.instructors.slice(0, limit)) {
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

    async function seedPositions(limit = 1000) {
        setStage("Positions");
        setProgress(0);
        const data = (normalizeImport(
            {
                fileType: "json",
                data: seedData.positions.slice(0, limit),
            },
            positionSchema
        ) as MinimalPosition[]).map((position) =>
            prepareFull.position(position, {
                instructors,
                contractTemplates,
            })
        );
        await progressDispatch(upsertPosition, data, 10, setProgress);
    }

    async function seedApplicants(limit = 1000) {
        setStage("Applicants");
        setProgress(0);
        const data = normalizeImport(
            {
                fileType: "json",
                data: seedData.applicants.slice(0, limit),
            },
            applicantSchema
        );

        await progressDispatch(upsertApplicant, data, 10, setProgress);
    }

    async function seedAssignments(limit = 1000) {
        setStage("Assignments");
        setProgress(0);
        if (!targetSession) {
            throw new Error("Need a valid session to continue");
        }
        const data = (normalizeImport(
            {
                fileType: "json",
                data: seedData.assignments.slice(0, limit),
            },
            assignmentSchema
        ) as MinimalAssignment[]).map((assignment) => {
            if (!targetSession) {
                throw new Error("Need a valid session to continue");
            }
            return prepareFull.assignment(assignment, {
                positions,
                applicants,
                session: targetSession,
            });
        });

        await progressDispatch(upsertAssignment, data, 10, setProgress);
    }

    async function seedAll() {
        await seedSession();
        await seedContractTemplate();
        await seedInstructors();
        await seedPositions();
        await seedApplicants();
        await seedAssignments();
    }

    function onSelectHandler(eventKey: string | null) {
        setSeedAction(
            seedActions[eventKey as keyof typeof seedActions]?.action || ident
        );
        setConfirmDialogVisible(true);
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
                        Load seed data into current session
                    </Dropdown.Header>
                    {Object.keys(seedActions).map((key: string) => (
                        <Dropdown.Item key={key} eventKey={key}>
                            {seedActions[key as keyof typeof seedActions].name}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            <Modal
                show={confirmDialogVisible}
                onHide={() => {
                    setConfirmDialogVisible(false);
                }}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Loading Seed Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {targetSession === null ? (
                        "Are you sure to create a new session and load mock data?"
                    ) : (
                        <React.Fragment>
                            Are you sure to load mock data into the session{" "}
                            <b>{targetSession.name}</b>?
                        </React.Fragment>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setConfirmDialogVisible(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            try {
                                setConfirmDialogVisible(false);
                                setInProgress(true);
                                await seedAction();
                            } catch (e) {
                                console.log(e);
                            } finally {
                                setInProgress(false);
                            }
                        }}
                    >
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
                        label={`${Math.round(progress)}%`}
                        style={{ minWidth: "90%" }}
                    />
                </Modal.Body>
            </Modal>
        </span>
    );
}
