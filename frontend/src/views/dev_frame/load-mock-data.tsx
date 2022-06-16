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
    activeSessionSelector,
    debugOnlyUpsertUser,
    debugOnlySetActiveUser,
    applicationsSelector,
    fetchActiveUser,
} from "../../api/actions";
import { apiGET, apiPOST } from "../../libs/api-utils";
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
    Applicant,
    ContractTemplate,
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
    const [confirmDialogVisible, setConfirmDialogVisible] =
        React.useState(false);
    const [seedAction, _setSeedAction] = React.useState<PromiseOrVoidFunction>(
        () => ident
    );
    const [inProgress, setInProgress] = React.useState(false);
    const [stage, setStage] = React.useState("");
    const [progress, setProgress] = React.useState(0);
    const dispatch = useThunkDispatch();
    const instructors = useSelector(instructorsSelector);
    const targetSession = useSelector(activeSessionSelector);
    let session: Session | null;
    let contractTemplates: ContractTemplate[] = [];
    let positions = useSelector(positionsSelector);
    let applicants: Applicant[] = [];
    let applications = useSelector(applicationsSelector);
    let count;
    let total;

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
        application: {
            name: `Applications (${seedData.applications.length})`,
            action: seedApplications,
        },
        instructorPref: {
            name: `Instructor Preferences (${seedData.applications.length})`,
            action: seedInstructorPreferences,
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

    async function seedSession() {
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

    async function seedUsers(limit = 600) {
        setProgress(0);
        setStage("Users");
        const users = seedData.users.slice(0, limit);
        count = 0;
        for (const user of users) {
            await dispatch(debugOnlyUpsertUser(user));
            count++;
            setProgress(Math.round((count / users.length) * 100));
        }
        setProgress(100);
    }

    async function seedContractTemplate() {
        setProgress(0);
        setStage("Contract Template");
        const contractTemplate = await dispatch(
            upsertContractTemplate(seedData.contractTemplates[0])
        );
        contractTemplates.push(contractTemplate);
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
        count = 0;
        total = seedData.positions.length;
        const data = (
            normalizeImport(
                {
                    fileType: "json",
                    data: seedData.positions,
                },
                positionSchema
            ) as MinimalPosition[]
        ).map((position) =>
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

    async function seedApplicants(limit = 1000) {
        setStage("Applicants");
        setProgress(0);
        count = 0;
        total = seedData.applicants.length;
        const data = normalizeImport(
            {
                fileType: "json",
                data: seedData.applicants,
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

    async function seedAssignments(limit = 1000) {
        setStage("Assignments");
        setProgress(0);
        if (!session) {
            throw new Error("Need a valid session to continue");
        }
        count = 0;
        total = seedData.assignments.length;
        const data = (
            normalizeImport(
                {
                    fileType: "json",
                    data: seedData.assignments,
                },
                assignmentSchema
            ) as MinimalAssignment[]
        ).map((assignment) => {
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

    async function seedApplications(limit = 600) {
        setStage("Applications");
        setProgress(0);

        if (!targetSession) {
            throw new Error("Need a valid session to continue");
        }

        let count = 0;
        let total = seedData.applications.length;

        // Keep track of the original active user so we can swap back
        const initialUser = await dispatch(fetchActiveUser());

        // Get this session's posting token:
        const resp = await apiGET(
            `/admin/sessions/${targetSession.id}/postings`
        );
        let url_token = resp[0].url_token;

        for (const application of seedData.applications.slice(0, limit)) {
            const currUser = {
                utorid: application.utorid,
                roles: ["admin", "instructor", "ta"],
            };
            await dispatch(
                debugOnlySetActiveUser(currUser, { skipInit: true })
            );

            const newApp = {
                utorid: application.utorid,
                student_number: application.student_number,
                first_name: application.first_name,
                last_name: application.last_name,
                email: application.email,
                phone: application.phone.toString(),
                program: application.program,
                department: application.department,
                yip: application.yip,
                gpa: application.gpa || 0,
                previous_department_ta: application.previous_department_ta,
                previous_university_ta: application.previous_university_ta,
                program_start: application.program_start,
                previous_other_university_ta:
                    application.previous_other_university_ta,
                position_preferences: application.position_preferences,
            };

            await apiPOST(
                `/public/postings/${url_token}/submit`,
                { answers: newApp },
                true
            );

            count++;
            setProgress(Math.round((count / total) * 100));
        }

        await dispatch(debugOnlySetActiveUser(initialUser));
        setProgress(100);
    }

    async function seedInstructorPreferences(limit = 600) {
        setStage("Instructor Preferences");
        setProgress(0);

        if (!targetSession) {
            throw new Error("Need a valid session to continue");
        }

        let count = 0;
        let total = seedData.applications.length;

        const preferences = [];

        for (const application of seedData.applications.slice(0, limit)) {
            if (!application.instructor_preferences) {
                continue;
            }

            const targetApplication =
                applications.find(
                    (currApplication) =>
                        currApplication.applicant.utorid === application.utorid
                ) || null;

            if (!targetApplication) {
                throw new Error("No application found for " + application);
            }

            for (let preference of application.instructor_preferences) {
                const targetPosition =
                    positions.find(
                        (currPosition) =>
                            currPosition.position_code ===
                            preference.position_code
                    ) || null;

                if (!targetPosition) {
                    throw new Error(
                        "No position found for " + preference.position_code
                    );
                }

                preferences.push({
                    preference_level: preference.preference_level,
                    comment: preference.comment,
                    application_id: targetApplication.id,
                    position_id: targetPosition.id,
                });
            }
        }

        for (let preference of preferences) {
            apiPOST(`/instructor/instructor_preferences`, preference);
            count++;
            setProgress(Math.round((count / total) * 100));
        }

        setProgress(100);
    }

    async function seedAll() {
        try {
            setConfirmDialogVisible(false);
            setInProgress(true);

            await seedSession();
            await seedContractTemplate();
            await seedInstructors();
            await seedPositions();
            await seedApplicants();
            await seedAssignments();
        } catch (error) {
            console.error(error);
        } finally {
            setInProgress(false);
        }
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
                        label={`${progress}%`}
                        style={{ minWidth: "90%" }}
                    />
                </Modal.Body>
            </Modal>
        </span>
    );
}
