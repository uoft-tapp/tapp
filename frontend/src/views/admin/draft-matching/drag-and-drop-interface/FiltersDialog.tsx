import { useSelector } from "react-redux";
import { Posting } from "../../../../api/defs/types";
import {
    AssignmentDraft,
    draftMatchingSlice,
    filtersSelector,
} from "../state/slice";
import React from "react";
import { Button, Card, Form, InputGroup, Modal } from "react-bootstrap";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import { BsTrash } from "react-icons/bs";
import { MergedApplication } from "./mergeApplications";
import { collator } from "./ApplicantList";

export function FiltersDialog({
    show,
    onClose,
    applicationByUtorid,
    assignmentsByUtorid,
}: {
    show: boolean;
    onClose: () => void;
    applicationByUtorid: Map<string, MergedApplication>;
    assignmentsByUtorid: Map<string, AssignmentDraft[]>;
}) {
    const dispatch = useThunkDispatch();
    const filters = useSelector(filtersSelector);
    const [hideMinimumHoursBelow, setHideMinimumHoursBelow] = React.useState(
        filters.hideMinimumHoursBelow
    );

    // Get a set of all departments represented in the applicant pool
    const allDepartments = React.useMemo(() => {
        const depts = new Set<string>(
            Array.from(applicationByUtorid.values()).map(
                (app) => app.department || ""
            )
        );
        let ret = [...depts]
            .sort((a, b) => collator.compare(a, b))
            .filter((dept) => dept.length > 0);
        return ret;
    }, [applicationByUtorid]);
    const allPrograms = React.useMemo(() => {
        const programs = new Set<string>(
            Array.from(applicationByUtorid.values()).map(
                (app) => app.program || ""
            )
        );
        let ret = [...programs]
            .sort((a, b) => collator.compare(a, b))
            .filter((program) => program.length > 0);
        return ret as ("M" | "P" | "U" | "Other")[];
    }, [applicationByUtorid]);
    const allPostings = React.useMemo(() => {
        const postingsById: Record<number, Posting> = {};
        for (const app of applicationByUtorid.values()) {
            for (const posting of app.mergedFrom) {
                postingsById[posting.id] = posting;
            }
        }

        return Object.values(postingsById).sort(
            (a, b) =>
                new Date(a.open_date!).getTime() -
                new Date(b.open_date!).getTime()
        );
    }, [applicationByUtorid]);

    const toggleDepartmentFilter = (dept: string) => {
        const currentlyIncluded = filters.hiddenDepartments.includes(dept);
        const newHiddenDepartments = currentlyIncluded
            ? filters.hiddenDepartments.filter((d) => d !== dept)
            : [...filters.hiddenDepartments, dept];
        dispatch(
            draftMatchingSlice.actions.setFilter({
                hiddenDepartments: newHiddenDepartments,
            })
        );
    };

    const toggleProgramFilter = (program: "M" | "P" | "U" | "Other") => {
        const currentlyIncluded = filters.hiddenPrograms.includes(program);
        const newHiddenPrograms = currentlyIncluded
            ? filters.hiddenPrograms.filter((p) => p !== program)
            : [...filters.hiddenPrograms, program];
        dispatch(
            draftMatchingSlice.actions.setFilter({
                hiddenPrograms: newHiddenPrograms,
            })
        );
    };
    const toggleExperienceLevelFilter = (
        level: "department-experience" | "university-experience" | "new-ta"
    ) => {
        const currentlyIncluded =
            filters.hiddenExperienceLevels.includes(level);
        const newHiddenExperienceLevels = currentlyIncluded
            ? filters.hiddenExperienceLevels.filter((l) => l !== level)
            : [...filters.hiddenExperienceLevels, level];
        dispatch(
            draftMatchingSlice.actions.setFilter({
                hiddenExperienceLevels: newHiddenExperienceLevels,
            })
        );
    };

    const togglePostingFilter = (postingName: string) => {
        const currentlyIncluded = filters.hiddenPostings.includes(postingName);
        const newHiddenPostings = currentlyIncluded
            ? filters.hiddenPostings.filter((id) => id !== postingName)
            : [...filters.hiddenPostings, postingName];
        dispatch(
            draftMatchingSlice.actions.setFilter({
                hiddenPostings: newHiddenPostings,
            })
        );
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            size="xl"
            className="filters-dialog-parent"
        >
            <Modal.Header closeButton>
                <Modal.Title>Filters</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pb-0">
                Show/hide applicants based on the filters below. To show/hide
                specific applicants based on <code>utorid</code>, set a
                Show/Hide list in the Additional Data dialog.
            </Modal.Body>
            <Modal.Body className="filters-dialog-body">
                <Card>
                    <Card.Body>
                        <Card.Title>Posting</Card.Title>
                        <Card.Text>
                            Applicants from the postings listed below are
                            visible.
                        </Card.Text>
                        <Form className="compact-checkbox-options">
                            {allPostings.map((posting) => (
                                <Form.Check
                                    key={posting.id}
                                    id={`filter-posting-${posting.id}`}
                                    type="checkbox"
                                    label={posting.name}
                                    checked={
                                        !filters.hiddenPostings.includes(
                                            posting.name
                                        )
                                    }
                                    onChange={() => {
                                        togglePostingFilter(posting.name);
                                    }}
                                />
                            ))}
                        </Form>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Title>Program</Card.Title>
                        <Card.Text>
                            Applicants from the programs listed below are
                            visible.
                        </Card.Text>
                        <Form className="compact-checkbox-options">
                            {allPrograms.map((program) => (
                                <Form.Check
                                    key={program}
                                    id={`filter-program-${program}`}
                                    type="checkbox"
                                    label={program}
                                    checked={
                                        !filters.hiddenPrograms.includes(
                                            program
                                        )
                                    }
                                    onChange={() => {
                                        toggleProgramFilter(program);
                                    }}
                                />
                            ))}
                        </Form>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Title>Experience Level</Card.Title>
                        <Card.Text>
                            Applicants with the experience levels listed below
                            are visible.
                        </Card.Text>
                        <Form>
                            <Form.Check
                                id={`filter-experience-department`}
                                type="checkbox"
                                label={"Has TAed in the department before"}
                                checked={
                                    !filters.hiddenExperienceLevels.includes(
                                        "department-experience"
                                    )
                                }
                                onChange={() => {
                                    toggleExperienceLevelFilter(
                                        "department-experience"
                                    );
                                }}
                            />
                            <Form.Check
                                id={`filter-experience-university`}
                                type="checkbox"
                                label={
                                    "Has TAed at the university before, but not in the department"
                                }
                                checked={
                                    !filters.hiddenExperienceLevels.includes(
                                        "university-experience"
                                    )
                                }
                                onChange={() => {
                                    toggleExperienceLevelFilter(
                                        "university-experience"
                                    );
                                }}
                            />
                            <Form.Check
                                id={`filter-experience-new`}
                                type="checkbox"
                                label={"New (has never TAed before)"}
                                checked={
                                    !filters.hiddenExperienceLevels.includes(
                                        "new-ta"
                                    )
                                }
                                onChange={() => {
                                    toggleExperienceLevelFilter("new-ta");
                                }}
                            />
                        </Form>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Title>Minimum Required Hours</Card.Title>
                        <Card.Text>
                            Applicants whose required hours (for example,
                            because of a subsequent appointment guarantee) are
                            below this threshold are hidden.
                        </Card.Text>
                        <Form>
                            <InputGroup>
                                <InputGroup.Text>
                                    Hide if hours {"<"}{" "}
                                </InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={hideMinimumHoursBelow}
                                    onChange={(e) => {
                                        // We handle changes locally so we can type without major slowdowns
                                        const newValue = parseInt(
                                            e.target.value
                                        );
                                        setHideMinimumHoursBelow(newValue);
                                    }}
                                    onBlur={() => {
                                        dispatch(
                                            draftMatchingSlice.actions.setFilter(
                                                {
                                                    hideMinimumHoursBelow,
                                                }
                                            )
                                        );
                                    }}
                                />
                            </InputGroup>
                        </Form>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Title>Department</Card.Title>
                        <Card.Text>
                            Applicants from the departments listed below are
                            visible.
                        </Card.Text>
                        <Form className="compact-checkbox-options">
                            {allDepartments.map((dept) => (
                                <Form.Check
                                    key={dept}
                                    id={`filter-department-${dept}`}
                                    type="checkbox"
                                    label={dept}
                                    checked={
                                        !filters.hiddenDepartments.includes(
                                            dept
                                        )
                                    }
                                    onChange={() => {
                                        toggleDepartmentFilter(dept);
                                    }}
                                />
                            ))}
                        </Form>
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="warning"
                    onClick={() => {
                        onClose();
                        dispatch(draftMatchingSlice.actions.clearAllFilters());
                        setHideMinimumHoursBelow(0);
                    }}
                >
                    <BsTrash className="me-2" />
                    Clear All Filters
                </Button>
                <Button variant="primary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
