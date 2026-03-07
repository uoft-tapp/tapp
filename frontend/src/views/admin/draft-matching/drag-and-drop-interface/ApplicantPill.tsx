import { Applicant, Application } from "../../../../api/defs/types";
import React from "react";
import {
    AssignmentDraft,
    activePositionCodesSelector,
    draftMatchingSlice,
} from "../state/slice";
import {
    BsBuilding,
    BsBuildingFillCheck,
    BsLock,
    BsPencil,
} from "react-icons/bs";
import { departmentCodes, programCodes } from "../../matching/name-maps";
import { Button, CloseButton, Modal } from "react-bootstrap";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { assignmentShouldBeVisible } from "./AssignmentRow";

export type AdditionalInfo = {
    annotation?: string;
    minHours?: number;
    maxHours?: number;
};

export type DropInfo = {
    parent:
        | {
              source: "applicant-list";
          }
        | { source: "position-row"; positionCode: string };
};

type FulfillmentStatus = "under" | "met" | "over" | "unknown";

/**
 * Display information about an applicant.
 */
export function ApplicantPill({
    applicant,
    assignment,
    application,
    allAssignments,
    additionalInfo,
    parent,
}: {
    applicant: Applicant;
    assignment?: AssignmentDraft;
    application?: Application;
    allAssignments?: AssignmentDraft[];
    /**
     * Additional info useful for rendering the applicant pill.
     */
    additionalInfo: AdditionalInfo;
    /**
     * Where the pill is being rendered. This is used to produce different drag-and-drop behaviour depending on where the pill is being dragged from.
     */
    parent: DropInfo["parent"];
}) {
    const dispatch = useThunkDispatch();
    const [editHoursModalOpen, setEditHoursModalOpen] = React.useState(false);
    const assignedHours = allAssignments
        ? allAssignments
              .filter(assignmentShouldBeVisible)
              .reduce((sum, a) => sum + a.hours, 0)
        : 0;
    const [isDragging, setIsDragging] = React.useState(false);
    // Group preferences by level and then sort by position code.
    const prefsByLevel = React.useMemo(() => {
        const ret = { [-1]: [], 0: [], 1: [], 2: [], 3: [] } as {
            [level: number]: string[];
        };
        if (!application) {
            return ret;
        }
        application.position_preferences.forEach((pref) => {
            if (!ret[pref.preference_level]) {
                console.log(
                    "Invalid preference level",
                    pref,
                    application.applicant
                );
                return;
            }
            ret[pref.preference_level].push(pref.position.position_code);
        });
        Object.values(ret).forEach((level) => {
            level.sort();
        });
        return ret;
    }, [application]);
    const prefsLabel = ` Very High (+3): ${prefsByLevel[3].join(
        ", "
    )}\n High (+2): ${prefsByLevel[2].join(
        ", "
    )}\n Medium (+1): ${prefsByLevel[1].join(
        ", "
    )}\n\n Negative (-1): ${prefsByLevel[-1].join(", ")}`;

    const minHours = additionalInfo?.minHours ?? 0;
    const maxHours = additionalInfo?.maxHours ?? 0;
    const fulfillmentStatus: FulfillmentStatus =
        // If maxHours is 0, this applicant has no restrictions on hours, so they are met if they have any assignment.
        maxHours === 0 && assignedHours > 0
            ? "met"
            : minHours === 0 && assignedHours === 0 // If there is no minimum number of hours, we don't need to assign them anything, so they are "unknown" until we assign some hours.
            ? "unknown"
            : assignedHours < minHours
            ? "under"
            : assignedHours > maxHours
            ? "over"
            : assignedHours >= minHours && assignedHours <= maxHours
            ? "met"
            : "unknown";

    return (
        <div
            className={classNames("applicant-pill", {
                "is-dragging": isDragging,
            })}
            draggable={assignment ? !!assignment.mutable : true}
            onDragStart={(e) => {
                setIsDragging(true);
                // Send the applicant utorid as drag data.
                e.dataTransfer.setData("text/plain", applicant.utorid);
                // Send the entire applicant as JSON data.
                e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify(applicant)
                );
                // Set the source of the drag
                const dropInfo: DropInfo = {
                    parent,
                };
                e.dataTransfer.setData(
                    "application/x-tapp-data+json",
                    JSON.stringify(dropInfo)
                );

                dispatch(
                    draftMatchingSlice.actions.setActiveApplicantUtorid(
                        applicant.utorid
                    )
                );
            }}
            onDragEnd={() => {
                setIsDragging(false);
            }}
            title={`${applicant.first_name} ${applicant.last_name} (${
                applicant.utorid
            })\nDesired Hours: ${
                minHours === maxHours ? minHours : `${minHours}-${maxHours}`
            }\nAssigned Hours: ${assignedHours}\nAssigned to: ${JSON.stringify(
                (allAssignments || []).map((a) => a.position.position_code)
            )}\nPreferences:\n${prefsLabel}`}
        >
            <div
                className={classNames(
                    "applicant-status",
                    `hours-${fulfillmentStatus}`
                )}
            >
                <div>{assignedHours}</div>
                <div>
                    {minHours === maxHours
                        ? minHours
                        : `${minHours}-${maxHours}`}
                </div>
            </div>
            <div className="applicant-pill-content">
                <div className="grid-row">
                    <div className="applicant-name">
                        {applicant.first_name} {applicant.last_name} (
                        {applicant.utorid})
                    </div>
                </div>
                <ApplicantPillApplicationDetails application={application} />
            </div>
            <div className="applicant-actions">
                {assignment &&
                    (!assignment.mutable ? (
                        <BsLock title="This is not a draft assignment. To change this assignment, you must go to the Assignments page and withdraw the assignment." />
                    ) : (
                        <>
                            <CloseButton
                                title={`Remove draft assignment`}
                                onClick={() => {
                                    dispatch(
                                        draftMatchingSlice.actions.removeDraftAssignment(
                                            assignment
                                        )
                                    );
                                }}
                            />
                            <Button
                                variant="light"
                                size="sm"
                                className="edit-button"
                                title="Edit hours for this assignment"
                                onClick={() => setEditHoursModalOpen(true)}
                            >
                                <BsPencil />
                            </Button>
                        </>
                    ))}
            </div>
            {assignment && (
                <EditAssignmentHoursModal
                    assignment={assignment}
                    open={editHoursModalOpen}
                    onClose={() => {
                        setEditHoursModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function PreferenceLevelDisplay({ level }: { level: number | null }) {
    if (level === null) {
        return null;
    }
    let text = "";
    if (level < 0) {
        text = "-";
    }
    if (level > 0) {
        text = "+".repeat(level);
    }
    return (
        <div
            className={`preference-level grid-detail-small level-${level}`}
            title={`Preference Level: ${level}\nScale is -1 to 2 (hightest)`}
        >
            {text}
        </div>
    );
}

/**
 * Display information from the application, like department, program (masters/PhD), year of study, etc.
 */
export function ApplicantPillApplicationDetails({
    application,
}: {
    application?: Application;
}) {
    const activePositions = useSelector(activePositionCodesSelector);
    // Our active preference is the max of our preference level for all active positions.
    const activePreferenceLevel = React.useMemo(() => {
        if (!application) {
            return null;
        }
        const levels = (application?.position_preferences || [])
            .filter((pref) =>
                activePositions.includes(pref.position.position_code)
            )
            .map((pref) => pref.preference_level);
        if (levels.length === 0) {
            return null;
        }
        return Math.max(...levels);
    }, [activePositions, application]);

    if (!application) {
        return null;
    }

    const experience: "dept" | "uni" | "new" =
        application.previous_department_ta
            ? "dept"
            : application.previous_university_ta
            ? "uni"
            : "new";

    const deptCode = departmentCodes[application.department || "?"] || {
        abbrev: "",
        full: "Unknown Department",
    };
    const programCode = programCodes[application.program || "?"] || {
        abbrev: "",
        full: "Unknown Program",
    };
    return (
        <div className="applicant-application-details grid-row">
            <div className="grid-detail-small" title={deptCode.full}>
                {deptCode.abbrev}
            </div>
            <div className="grid-detail-small" title={programCode.full}>
                {programCode.abbrev}
                {application.yip}
            </div>
            <div
                className="grid-detail-small"
                title={
                    experience === "new"
                        ? `No prior TA experience`
                        : `TA has experience as a TA in ${
                              experience === "dept"
                                  ? "the department"
                                  : "a different department"
                          }`
                }
            >
                {experience === "dept" ? (
                    <BsBuildingFillCheck />
                ) : experience === "uni" ? (
                    <BsBuilding />
                ) : (
                    "New"
                )}
            </div>
            <PreferenceLevelDisplay level={activePreferenceLevel} />
        </div>
    );
}

/**
 * A dialog to edit the hours of a particular assignment.
 * @param param0
 */
function EditAssignmentHoursModal({
    assignment,
    open,
    onClose,
}: {
    assignment: AssignmentDraft;
    open: boolean;
    onClose: () => void;
}) {
    const dispatch = useThunkDispatch();
    const originalHours = assignment.hours;
    const [hours, setHours] = React.useState(originalHours);

    return (
        // We don't want to clutter up the dom with hundreds of modals, so forgo the animated transition and only show the modal when it's open.
        open && (
            <Modal show={open} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Assigned Hours</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label htmlFor="hours-input">Hours:</label>
                        <input
                            id="hours-input"
                            type="number"
                            className="form-control"
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            dispatch(
                                draftMatchingSlice.actions.removeDraftAssignment(
                                    assignment
                                )
                            );
                            dispatch(
                                draftMatchingSlice.actions.addDraftAssignment({
                                    ...assignment,
                                    hours,
                                })
                            );
                            onClose();
                        }}
                        disabled={hours === originalHours}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    );
}
