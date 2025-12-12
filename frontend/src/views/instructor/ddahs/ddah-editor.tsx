import React from "react";
import type { Ddah, Duty } from "../../../api/defs/types";
import {
    FaEdit,
    FaDownload,
    FaTrash,
    FaPlus,
    FaSave,
    FaInfoCircle,
} from "react-icons/fa";

import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { formatDate, formatDownloadUrl } from "../../../libs/utils";
import { splitDutyDescription } from "./../../../libs/ddah-utils";

import "./style.css";
import { DialogRow } from "../../../components/forms/common-controls";
import { stringToNativeType } from "../../../libs/urls";

type Category =
    | "note"
    | "prep"
    | "training"
    | "meeting"
    | "contact"
    | "marking"
    | "other";
export interface RowData {
    id?: number;
    position_code: string;
    last_name: string;
    first_name: string;
    total_hours: number | null;
    status: string | null;
    recent_activity_date: string | null;
    emailed_date: string | null;
    issues: string | null;
    issue_code: "hours_mismatch" | "missing" | null;
}

const categoryInformation: Record<
    Category,
    { title: string; helpText: string }
> = {
    note: {
        title: "Notes",
        helpText:
            "As notes, you must list (a) the enrollment per TA Section at the time of the DDAH, (b) the estimated course enrollment, (c) the tutorial category (discussion-based/skill-development/exam review/practical), and (d) whether tutorials have 30-or-less or more than 30 students. You may list this information in one note or in multiple notes.",
    },
    prep: {
        title: "Preparation",
        helpText:
            "Preparation time must include at least 1 hour per different tutorial lesson. If a TA runs the same tutorial multiple times, the prep time may be the same as if the TA ran the tutorial only once.",
    },
    training: { title: "Training", helpText: "" },
    meeting: {
        title: "Meetings",
        helpText:
            "Meetings must include a minimum of 0.5 hours for a mid-semester check-in where you discuss with the TA whether their workload is appropriately balanced and whether the DDAH needs to be modified.",
    },
    contact: {
        title: "Contact Time",
        helpText:
            "Tutorials, Lecture TAing, and Office Hours should be listed here.",
    },
    marking: {
        title: "Marking/Grading",
        helpText:
            'A breakdown of when assignments are expected to be available for marking, how long it will take to mark them, and the expected turnaround time must be included on a per-assignment basis. For example, you might write "20 hours marking Midterm 1; 120 tests; 10 minutes per test; available on Oct 4; expected turnaround time 5 days."',
    },
    other: { title: "Other duties", helpText: "" },
};

function DutyList({
    category,
    duties,
    showEmptyDutyString = true,
    editable = true,
    onChange,
    onDelete,
    onNew,
}: {
    category: Category;
    duties: Duty[];
    showEmptyDutyString?: boolean;
    editable?: boolean;
    onChange?: (category: Category, duty: Duty) => any;
    onDelete?: (duty: Duty) => any;
    onNew?: (category: Category) => any;
}): React.ReactElement | null {
    if (!duties) {
        return null;
    }
    const addNew =
        editable && onNew ? (
            <div className="form-row mb-3">
                <Button
                    title="Add Duty"
                    onClick={() => onNew && onNew(category)}
                    variant="outline-secondary"
                    size="sm"
                    className="ms-1"
                >
                    <FaPlus />
                </Button>
                <span className="add-duty">Add</span>
            </div>
        ) : null;
    if (showEmptyDutyString && duties.length === 0) {
        return (
            <React.Fragment>
                {addNew || <li className="duty no-duties">No Duties Listed</li>}
            </React.Fragment>
        );
    }
    return (
        <React.Fragment>
            {duties.map((duty) =>
                editable ? (
                    <DutyItem
                        key={duty.order}
                        category={category}
                        duty={duty}
                        onChange={onChange}
                        onDelete={onDelete}
                    />
                ) : (
                    <DutyItem
                        key={duty.order}
                        category={category}
                        duty={duty}
                    />
                )
            )}
            {addNew}
        </React.Fragment>
    );
}

function DutyItem({
    category,
    duty,
    onChange,
    onDelete,
}: {
    category: Category;
    duty: Duty;
    onChange?: (category: Category, duty: Duty) => any;
    onDelete?: (duty: Duty) => any;
}) {
    if (onChange) {
        return (
            <DialogRow
                icon={
                    onDelete ? (
                        <Button
                            title="Remove duty"
                            onClick={() => onDelete(duty)}
                            variant="outline-info"
                        >
                            <FaTrash />
                        </Button>
                    ) : null
                }
                colStretch={[1, 7]}
            >
                <>
                    {category === "note" ? (
                        <div />
                    ) : (
                        <React.Fragment>
                            <Form.Label>Hours</Form.Label>
                            <Form.Control
                                type="number"
                                value={duty.hours}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    onChange(category, {
                                        ...duty,
                                        hours: stringToNativeType(
                                            e.target.value
                                        ) as any,
                                    })
                                }
                            />
                        </React.Fragment>
                    )}
                </>
                <>
                    {category === "note" ? (
                        <React.Fragment>
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                title="Enter a note"
                                type="input"
                                value={duty.description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    onChange(category, {
                                        ...duty,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                title="Enter a description of what these hours are allocated for"
                                type="input"
                                value={duty.description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    onChange(category, {
                                        ...duty,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </React.Fragment>
                    )}
                </>
            </DialogRow>
        );
    }
    return (
        <li className="duty">
            {category !== "note" ? (
                <span className="duty-hours">{duty.hours}</span>
            ) : null}
            <span className="duty-description">{duty.description}</span>
        </li>
    );
}

export function DdahPreviewModal({
    ddah,
    show,
    onHide: _onHide = () => {},
    onEdit = () => {},
    forceEditMode = false,
}: {
    ddah: Omit<Ddah, "id"> | null;
    show: boolean;
    onHide?: Function;
    onEdit?: Function;
    forceEditMode?: boolean;
}): React.ReactElement {
    let ddahPreview: React.ReactElement | string = "No DDAH to preview";
    let url: string | null = null;
    const receivedDuties = React.useMemo(() => {
        const ret = ddah ? [...ddah.duties] : [];
        ret.sort((a, b) => a.order - b.order);
        return ret;
    }, [ddah]);

    const [duties, setDuties] = React.useState(receivedDuties);
    const [_editing, setEditing] = React.useState(false);
    const editing = _editing || forceEditMode;
    const [inProgress, setInProgress] = React.useState(false);

    React.useEffect(() => {
        // Whenever the input DDAH changes, we want to reset the duties to
        // its duties. This happens after a save/etc.
        if (ddah != null) {
            setDuties(receivedDuties);
        }
    }, [ddah, receivedDuties]);

    function onHide() {
        // If the window gets hidden while we are editing, we want editing mode stop,
        // and we want to reset the state.
        setEditing(false);
        setDuties(receivedDuties);
        _onHide();
    }

    function onDutyChange(category: Category, newDuty: Duty) {
        const newDuties = duties.map((duty) => {
            if (duty.order !== newDuty.order) {
                return duty;
            }
            // The categories have been stripped from `newDuty`, so we need to put them back.
            newDuty = {
                ...newDuty,
                description: `${category}:${newDuty.description}`,
            };
            return { ...duty, ...newDuty };
        });
        setDuties(newDuties);
    }
    function onDutyAdd(category: Category) {
        const maxOrder = Math.max(...duties.map((duty) => duty.order));
        const order = Number.isFinite(maxOrder) ? maxOrder + 1 : -1;
        setDuties([
            ...duties,
            { order, hours: 0, description: `${category}:` },
        ]);
    }
    function onDutyDelete(duty: Duty) {
        setDuties(duties.filter((d) => d.order !== duty.order));
    }

    if (ddah != null) {
        let totalHours = 0;
        for (const duty of duties) {
            totalHours += duty.hours;
        }
        const hoursMismatch = ddah.assignment
            ? ddah.assignment.hours !== totalHours
            : false;
        const dutiesByCategory: Record<Category, Duty[]> = {
            note: [],
            prep: [],
            training: [],
            meeting: [],
            contact: [],
            marking: [],
            other: [],
        };
        for (const duty of duties) {
            const { category, description } = splitDutyDescription(
                duty.description
            ) as { category: Category; description: string };
            dutiesByCategory[category] = dutiesByCategory[category] || [];
            dutiesByCategory[category].push({ ...duty, description });
        }

        const assignment = ddah.assignment;
        const applicant = assignment.applicant;
        const position = assignment.position;

        ddahPreview = (
            <div className="instructor-ddah-preview-container">
                <table className="position-summary">
                    <tbody>
                        <tr>
                            <th>TA:</th>
                            <td>
                                {applicant.first_name} {applicant.last_name}
                            </td>
                        </tr>
                        <tr>
                            <th>Position:</th>
                            <td>
                                {position.position_code} (
                                {position.position_title})
                            </td>
                        </tr>
                    </tbody>
                </table>
                <h4>Notes</h4>
                {editing && (
                    <Alert variant="secondary">
                        <FaInfoCircle className="me-2" />
                        {categoryInformation["note"].helpText}
                    </Alert>
                )}
                <ul>
                    <DutyList
                        category={"note"}
                        duties={dutiesByCategory["note"] || []}
                        showEmptyDutyString={false}
                        onChange={onDutyChange}
                        onDelete={onDutyDelete}
                        onNew={onDutyAdd}
                        editable={editing}
                    />
                </ul>
                <h4>Duties</h4>
                {(
                    [
                        "meeting",
                        "prep",
                        "contact",
                        "marking",
                        "training",
                        "other",
                    ] as Category[]
                ).map((category) => (
                    <React.Fragment key={category}>
                        <h6>{categoryInformation[category].title}</h6>
                        {editing && categoryInformation[category].helpText && (
                            <Alert variant="secondary">
                                <FaInfoCircle className="me-2" />
                                {categoryInformation[category].helpText}
                            </Alert>
                        )}
                        <ul>
                            <DutyList
                                category={category}
                                duties={dutiesByCategory[category] || []}
                                onChange={onDutyChange}
                                onDelete={onDutyDelete}
                                onNew={onDutyAdd}
                                editable={editing}
                            />
                        </ul>
                    </React.Fragment>
                ))}
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
                <div className="signature-area">
                    <div>
                        Prepared
                        {ddah.emailed_date
                            ? ` on ${formatDate(ddah.emailed_date)}`
                            : ""}
                    </div>
                    <div>
                        {ddah.accepted_date
                            ? `Acknowledged by ${applicant.first_name} ${
                                  applicant.last_name
                              } on ${formatDate(ddah.accepted_date)}`
                            : "Not yet acknowledged"}
                    </div>
                </div>
            </div>
        );
        url = `/public/ddahs/${ddah.url_token}.pdf`;
    }

    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="me-1" />
    ) : null;
    let footer = (
        <React.Fragment>
            <Button variant="outline-secondary" onClick={() => onHide()}>
                Close
            </Button>
            <Button variant="outline-info" onClick={() => setEditing(true)}>
                <FaEdit className="me-2" />
                Edit
            </Button>
            {url && (
                <Button
                    title="Download DDAH."
                    variant="link"
                    href={formatDownloadUrl(url)}
                >
                    <FaDownload className="me-2" />
                    Download PDF
                </Button>
            )}
        </React.Fragment>
    );
    if (editing) {
        footer = (
            <React.Fragment>
                <Button
                    variant="outline-secondary"
                    onClick={() => {
                        setDuties(receivedDuties);
                        setEditing(false);
                        if (forceEditMode) {
                            // If we are forced into edit mode, the cancel should be a close
                            // button rather than a "return to preview" button.
                            onHide();
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="outline-info"
                    onClick={async () => {
                        setInProgress(true);
                        await onEdit({ ...ddah, duties });
                        setInProgress(false);
                        setEditing(false);
                    }}
                >
                    {spinner || <FaSave className="me-2" />}
                    Save
                </Button>
            </React.Fragment>
        );
    }

    return (
        <Modal show={show} onHide={onHide} dialogClassName="wide-modal">
            <Modal.Header closeButton>
                <Modal.Title>
                    Description of Duties and Allocation of Hours
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>{ddahPreview}</Modal.Body>
            <Modal.Footer>{footer}</Modal.Footer>
        </Modal>
    );
}
