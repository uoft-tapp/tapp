import { Applicant, Application } from "../../../../api/defs/types";
import React from "react";
import {
    AssignmentDraft,
    activePositionCodesSelector,
    draftMatchingSlice,
} from "../state/slice";
import { BsLock } from "react-icons/bs";
import { departmentCodes, programCodes } from "../../matching/name-maps";
import { CloseButton } from "react-bootstrap";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { assignmentShouldBeVisible } from "./AssignmentRow";

export type AssignmentInfo = {
    hoursAssigned: number;
    minHours: number;
    maxHours: number;
};

export type DropInfo = {
    parent:
        | {
              source: "applicant-list";
          }
        | { source: "position-row"; positionCode: string };
};

/**
 * Display information about an applicant.
 */
export function ApplicantPill({
    applicant,
    assignment,
    application,
    allAssignments,
    parent,
}: {
    applicant: Applicant;
    assignment?: AssignmentDraft;
    application?: Application;
    allAssignments?: AssignmentDraft[];
    /**
     * Where the pill is being rendered. This is used to produce different drag-and-drop behaviour depending on where the pill is being dragged from.
     */
    parent: DropInfo["parent"];
}) {
    const dispatch = useThunkDispatch();
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

    return (
        <div
            className={classNames("applicant-pill", {
                "is-dragging": isDragging,
            })}
            draggable
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
            })\nAssigned Hours: ${assignedHours}\nAssigned to: ${JSON.stringify(
                (allAssignments || []).map((a) => a.position.position_code)
            )}\nPreferences:\n${prefsLabel}`}
        >
            <div className={classNames("applicant-status")}>
                <div>{assignedHours}</div>
                <div>{0}</div>
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
                    ))}
            </div>
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
            <PreferenceLevelDisplay level={activePreferenceLevel} />
        </div>
    );
}
