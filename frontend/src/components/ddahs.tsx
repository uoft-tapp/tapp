import React from "react";
import { createDiffColumnsFromColumns } from "./diff-table";
import { MinimalDdah, Ddah, Assignment, Duty } from "../api/defs/types";
import { DiffSpec, ddahDutiesToString } from "../libs/diffs";
import { Form, Button } from "react-bootstrap";
import { DialogRow } from "./forms/common-controls";
import { Typeahead } from "react-bootstrap-typeahead";
import { FaPlus, FaTrash } from "react-icons/fa";
import { stringToNativeType } from "../libs/urls";
import { AdvancedFilterTable } from "./filter-table/advanced-filter-table";
import { splitDutyDescription } from "../libs/utils";

const DEFAULT_COLUMNS = [
    {
        Header: "Position",
        accessor: "assignment.position.position_code",
        maxWidth: 120,
    },
    {
        Header: "Last Name",
        accessor: "assignment.applicant.last_name",
        maxWidth: 120,
    },
    {
        Header: "First Name",
        accessor: "assignment.applicant.first_name",
        maxWidth: 120,
    },
    {
        Header: "Total Hours",
        accessor: "total_hours",
        maxWidth: 100,
        className: "number-cell",
    },
    { Header: "Duties", accessor: "duties" },
];

/**
 * Display a DiffSpec array of positions and highlight the changes.
 *
 * @export
 * @param {*} { modifiedApplicants }
 * @returns
 */
export function DdahsDiffList({
    modifiedDdahs,
}: {
    modifiedDdahs: DiffSpec<MinimalDdah, Ddah>[];
}) {
    // We want to flatten the `Duties` list in case it is displayed,
    // it needs to be a string.
    modifiedDdahs = modifiedDdahs.map((modifiedDdah) => {
        if (
            modifiedDdah.obj.duties == null ||
            typeof modifiedDdah.obj.duties === "string"
        ) {
            return modifiedDdah;
        }
        return {
            ...modifiedDdah,
            obj: {
                ...modifiedDdah.obj,
                // Lie to typescript. This is a string, but we don't really want to mess with the types
                duties: ddahDutiesToString(modifiedDdah.obj.duties) as any,
            },
        };
    });

    return (
        <DdahsList
            ddahs={modifiedDdahs as any[]}
            columns={createDiffColumnsFromColumns(DEFAULT_COLUMNS)}
        />
    );
}

export function DdahsList(props: {
    ddahs: (Omit<Ddah, "id"> | Ddah)[];
    columns?: any[];
}) {
    const { ddahs, columns = DEFAULT_COLUMNS } = props;

    // we want to display the duties as a single string,
    // so flatten any duties that are not already a string before rendering
    const flattenedDdahs = ddahs.map((ddah) => {
        // If `ddah.duties` is null, it means that we're not actually passing
        // in a Ddah type. In this case, leave it alone. If `ddah.duties` is already
        // a string, it has been converted by something else to a string already.
        if (ddah.duties == null || typeof ddah.duties === "string") {
            return ddah;
        }
        return { ...ddah, duties: ddahDutiesToString(ddah.duties) };
    });

    return <AdvancedFilterTable data={flattenedDdahs} columns={columns} />;
}

const DEFAULT_DDAH = {
    assignment: null,
    duties: [] as Duty[],
};

interface PartialDdah {
    assignment: Assignment | null;
    duties: Duty[];
}

function DutyRow({
    duty,
    removeDuty,
    upsertDuty,
}: {
    duty: Duty;
    removeDuty: Function;
    upsertDuty: Function;
}) {
    const { category, description } = splitDutyDescription(duty.description);
    return (
        <DialogRow
            icon={
                <Button
                    title="Remove duty"
                    onClick={() => removeDuty(duty)}
                    variant="outline-info"
                >
                    <FaTrash />
                </Button>
            }
            colStretch={[1, 2, 7]}
        >
            <>
                <Form.Label>Hours</Form.Label>
                <Form.Control
                    type="number"
                    value={duty.hours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        upsertDuty({
                            ...duty,
                            hours: stringToNativeType(e.target.value) as any,
                        })
                    }
                />
            </>
            <>
                <Form.Label>Category</Form.Label>
                <Form.Control
                    title="Enter what category these duties fit into"
                    as="select"
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        upsertDuty({
                            ...duty,
                            description: `${e.target.value}:${description}`,
                        })
                    }
                >
                    <option value="meeting">Meetings</option>
                    <option value="prep">Preparation</option>
                    <option value="contact">Contact time</option>
                    <option value="other">Other duties</option>
                    <option value="marking">Marking/Grading</option>
                    <option value="training">Training</option>
                </Form.Control>
            </>
            <>
                <Form.Label>Description</Form.Label>
                <Form.Control
                    title="Enter a description of what these hours are allocated for"
                    type="input"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        upsertDuty({
                            ...duty,
                            description: `${category}:${e.target.value}`,
                        })
                    }
                />
            </>
        </DialogRow>
    );
}

/**
 * Edit information about an applicant.
 *
 * @export
 * @param {{instructor: object, setInstructor: function}} props
 * @returns
 */
export function DdahEditor(props: {
    ddah: PartialDdah;
    setDdah: Function;
    assignments?: Assignment[];
    editableAssignment?: Boolean;
}) {
    const {
        ddah: ddahProps,
        setDdah,
        assignments = [],
        editableAssignment = true,
    } = props;
    const ddah = { ...DEFAULT_DDAH, ...ddahProps };

    // If the assignment is editable, we have a selector for the assignments,
    // otherwise it is rendered as fixed text.
    let assignmentNode: React.ReactNode = ddah.assignment
        ? ` ${ddah.assignment.position.position_code} for ${ddah.assignment.applicant.last_name}, ${ddah.assignment.applicant.first_name}`
        : "No Assignment";
    if (editableAssignment) {
        assignmentNode = (
            <Typeahead
                id="position-input"
                ignoreDiacritics={true}
                placeholder="Assignment..."
                multiple
                labelKey={(option: Assignment) =>
                    `${option.position.position_code} for ${option.applicant.last_name}, ${option.applicant.first_name}`
                }
                selected={ddah.assignment == null ? [] : [ddah.assignment]}
                options={assignments}
                onChange={setAssignment}
            />
        );
    }

    // Make a copy of the duties so that we can sort it without mutating the prop
    const duties = [...ddah.duties];
    duties.sort((a, b) => a.order - b.order);
    const nextOrder = Math.max(...duties.map((x) => x.order), 0) + 1;
    let totalHours = 0;
    for (const duty of duties) {
        totalHours += duty.hours;
    }
    const hoursMismatch = ddah.assignment
        ? ddah.assignment.hours !== totalHours
        : false;

    function setAssignment(assignments: Assignment[]) {
        const assignment = assignments[assignments.length - 1] || null;
        setDdah({ ...ddah, assignment });
    }

    function upsertDuty(duty: Duty) {
        let newDuties = duties.filter((x) => x.order !== duty.order);
        newDuties.push(duty);
        setDdah({ ...ddah, duties: newDuties });
    }

    function removeDuty(duty: Duty) {
        let newDuties = duties.filter((x) => x.order !== duty.order);
        setDdah({ ...ddah, duties: newDuties });
    }

    return (
        <Form>
            <DialogRow>
                <React.Fragment>
                    <Form.Label>Assignment</Form.Label>
                    {assignmentNode}
                </React.Fragment>
            </DialogRow>
            <h4>Duties</h4>
            {duties.map((duty) => (
                <DutyRow
                    duty={duty}
                    removeDuty={removeDuty}
                    upsertDuty={upsertDuty}
                    key={duty.order}
                />
            ))}
            <DialogRow>
                <Button
                    variant="outline-info"
                    onClick={() =>
                        upsertDuty({
                            description: "",
                            hours: 0,
                            order: nextOrder,
                        })
                    }
                >
                    <FaPlus className="add-duty-btn-icon" />
                    Add Duty
                </Button>
            </DialogRow>
            <DialogRow>
                <>
                    <span
                        className={
                            hoursMismatch ? "add-ddah-hours-mismatch" : ""
                        }
                    >
                        {totalHours}
                    </span>{" "}
                    of {ddah.assignment ? ddah.assignment.hours : "?"} hours
                    allocated{" "}
                    {hoursMismatch
                        ? `(${
                              (ddah.assignment?.hours || 0) - totalHours
                          } unassigned)`
                        : ""}
                </>
            </DialogRow>
        </Form>
    );
}
