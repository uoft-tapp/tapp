import { Application, Position } from "../../../../api/defs/types";
import React from "react";
import classNames from "classnames";
import {
    AssignmentDraft,
    activeApplicantUtoridSelector,
    draftMatchingSlice,
} from "../state/slice";
import { PositionLabel } from "./PositionLabel";
import { ApplicantPill } from "./ApplicantPill";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import { useSelector } from "react-redux";

/**
 * A row of the assignments table.
 */
export function AssignmentRow({
    position,
    assignmentsByPosition,
    assignmentsByUtorid,
    allUtorids,
    applicationByUtorid,
}: {
    position: Position;
    assignmentsByPosition: Map<string, AssignmentDraft[]>;
    assignmentsByUtorid: Map<string, AssignmentDraft[]>;
    allUtorids: Set<string>;
    applicationByUtorid: Map<string, Application>;
}) {
    const [utoridBeingDragged, setUtoridBeingDragged] = React.useState<
        string | null
    >(null);
    const draggedApplicant = applicationByUtorid.get(
        utoridBeingDragged!
    )?.applicant;

    const dispatch = useThunkDispatch();
    // This is the utorid being dragged, but it persists even after a drop.
    const activeApplicantUtorid = useSelector(activeApplicantUtoridSelector);
    const activePreferencesMap = new Map(
        (activeApplicantUtorid && applicationByUtorid.has(activeApplicantUtorid)
            ? applicationByUtorid.get(activeApplicantUtorid)!
                  .position_preferences
            : []
        ).map((pref) => [pref.position.position_code, pref.preference_level])
    );

    return (
        <React.Fragment key={position.id}>
            <div
                className={`position level level-${activePreferencesMap.get(
                    position.position_code
                )}`}
                key={position.id}
            >
                <PositionLabel
                    positionSummary={{
                        position: position,
                        assignments:
                            assignmentsByPosition.get(position.position_code) ??
                            [],
                    }}
                />
            </div>
            <div
                className={classNames(
                    "assignments",
                    "level",
                    `level-${activePreferencesMap.get(position.position_code)}`,
                    {
                        "active-drag-over": utoridBeingDragged,
                    }
                )}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Use drag data to figure out what applicant is being dragged.
                    const draggedApplicantUtorid =
                        e.dataTransfer.getData("text/plain");
                    // If the utorid is not recognized, ignore.
                    if (!allUtorids.has(draggedApplicantUtorid)) {
                        return;
                    }
                    setUtoridBeingDragged(draggedApplicantUtorid);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUtoridBeingDragged(null);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!utoridBeingDragged) {
                        console.log(
                            "Dropped a candidate into a position, but the candidate's utorid was not known. Received:",
                            e.dataTransfer.getData("text/plain")
                        );
                        return;
                    }
                    // If we are here, construct the new assignment draft to be added.
                    const assignmentDraft: AssignmentDraft = {
                        draft: true,
                        position: position,
                        active_offer_nag_count: null,
                        active_offer_recent_activity_date: null,
                        active_offer_status: null,
                        active_offer_url_token: null,
                        contract_override_pdf: null,
                        hours: position.hours_per_assignment || 0,
                        note: null,
                        start_date: position.start_date,
                        end_date: position.end_date,
                        applicant: draggedApplicant!,
                    };
                    // Add the assignment as a draft
                    dispatch(
                        draftMatchingSlice.actions.addDraftAssignment(
                            assignmentDraft
                        )
                    );

                    // Clear the drag state.
                    setUtoridBeingDragged(null);
                }}
            >
                {(assignmentsByPosition.get(position.position_code) ?? [])
                    .filter(assignmentShouldBeVisible)
                    .map((assignment) => (
                        <ApplicantPill
                            key={`${assignment.position.position_code}|${assignment.applicant.utorid}`}
                            applicant={assignment.applicant}
                            assignment={assignment}
                            application={applicationByUtorid.get(
                                assignment.applicant.utorid
                            )}
                            allAssignments={assignmentsByUtorid.get(
                                assignment.applicant.utorid
                            )}
                        />
                    ))}
                {utoridBeingDragged && draggedApplicant && (
                    <div className="drop-here-indicator">
                        {position.position_code}{" "}
                        {position.hours_per_assignment
                            ? `(${position.hours_per_assignment} hours)`
                            : ""}
                        <div className="applicant-pill">
                            <div className="applicant-name">
                                {draggedApplicant.first_name}{" "}
                                {draggedApplicant.last_name}
                            </div>
                            <div className="applicant-utorid">
                                {draggedApplicant.utorid}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}

/**
 * Whether an assignment should be visible in the display chart.
 * If an assignment has a rejected or withdrawn offer, it is not visible.
 */
export function assignmentShouldBeVisible(assignment: AssignmentDraft) {
    return !(
        assignment.active_offer_status === "rejected" ||
        assignment.active_offer_status === "withdrawn"
    );
}
