import { Application, Position } from "../../../../api/defs/types";
import React from "react";
import classNames from "classnames";
import {
    AssignmentDraft,
    activeApplicantUtoridSelector,
    assignmentKey,
    desiredHoursByUtoridSelector,
    draftAssignmentsByKeySelector,
    draftMatchingSlice,
} from "../state/slice";
import { PositionLabel } from "./PositionLabel";
import { ApplicantPill, DropInfo } from "./ApplicantPill";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import { useSelector } from "react-redux";
import {
    ConnectedDropIndicator,
    assignmentIsForbidden,
} from "../drop-indicator";

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
    const [targetHours, setTargetHours] = React.useState<number>(
        position.hours_per_assignment || 1
    );
    const draggedApplicant = applicationByUtorid.get(
        utoridBeingDragged!
    )?.applicant;
    const desiredHoursByUtorid = useSelector(desiredHoursByUtoridSelector);

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
    const draftAssignmentsByKey = useSelector(draftAssignmentsByKeySelector);
    // If there are different numbers of hours for different assignments for this position,
    // then we actually want to show sub-units labelled with how many hours each assignment has.
    const visibleAssignments = (
        assignmentsByPosition.get(position.position_code) ?? []
    ).filter(assignmentShouldBeVisible);
    const hoursSubunits = Array.from(
        new Set([
            ...visibleAssignments.map((assignment) => assignment.hours),
            position.hours_per_assignment || 0,
        ])
    ).sort(
        // We sort in ascending order *except* the preferred hours per assignment always comes first.
        (a, b) =>
            a === position.hours_per_assignment
                ? -1
                : b === position.hours_per_assignment
                ? 1
                : a - b
    );
    const showHoursSubunits = hoursSubunits.length > 1;
    const assignmentsByHours = new Map<number, AssignmentDraft[]>(
        hoursSubunits.map((hours) => [hours, []])
    );
    for (const assignment of visibleAssignments) {
        let existing = assignmentsByHours.get(assignment.hours) || [];
        existing.push(assignment);
        assignmentsByHours.set(assignment.hours, existing);
    }
    const currentlyAssignedToPosition = visibleAssignments
        .map((assignment) => assignment.applicant.utorid)
        .includes(activeApplicantUtorid ?? "");

    return (
        <React.Fragment>
            <div
                className={classNames(
                    `position`,
                    `level`,
                    `level-${activePreferencesMap.get(position.position_code)}`,
                    { "already-assigned": currentlyAssignedToPosition }
                )}
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
                    { "already-assigned": currentlyAssignedToPosition },
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
                    const dropInfo: DropInfo = JSON.parse(
                        e.dataTransfer.getData("application/x-tapp-data+json")
                    );
                    // Check to see if it is valid to create an assignment here.
                    const forbidden = assignmentIsForbidden(
                        draggedApplicant!,
                        position,
                        draftAssignmentsByKey
                        // existingDraftAssignmentsByKey
                    );
                    if (forbidden) {
                        setUtoridBeingDragged(null);
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
                        hours: targetHours,
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

                    // If we were dragged from another row, we should also remove the old draft assignment.
                    if (dropInfo.parent.source === "position-row") {
                        const oldPositionCode = dropInfo.parent.positionCode;
                        const oldAssignments =
                            assignmentsByPosition.get(oldPositionCode) ?? [];
                        const assignmentToRemove = oldAssignments.find(
                            (assignment) =>
                                assignment.applicant.utorid ===
                                draggedApplicant!.utorid
                        );
                        if (assignmentToRemove) {
                            dispatch(
                                draftMatchingSlice.actions.removeDraftAssignment(
                                    assignmentToRemove
                                )
                            );
                        }
                    }

                    // Clear the drag state.
                    setUtoridBeingDragged(null);
                }}
            >
                {hoursSubunits.map((hours) => {
                    const pills = assignmentsByHours
                        .get(hours)!
                        .map((assignment) => (
                            <ApplicantPill
                                key={assignmentKey(assignment)}
                                applicant={assignment.applicant}
                                assignment={assignment}
                                application={applicationByUtorid.get(
                                    assignment.applicant.utorid
                                )}
                                allAssignments={assignmentsByUtorid.get(
                                    assignment.applicant.utorid
                                )}
                                parent={{
                                    source: "position-row",
                                    positionCode: position.position_code,
                                }}
                                additionalInfo={{
                                    minHours:
                                        desiredHoursByUtorid[
                                            assignment.applicant.utorid
                                        ]?.minHours,
                                    maxHours:
                                        desiredHoursByUtorid[
                                            assignment.applicant.utorid
                                        ]?.maxHours,
                                }}
                                isActive={
                                    activeApplicantUtorid ===
                                    assignment.applicant.utorid
                                }
                            />
                        ));
                    const dropTarget = utoridBeingDragged &&
                        draggedApplicant &&
                        targetHours === hours && (
                            <ConnectedDropIndicator
                                position={{
                                    ...position,
                                    hours_per_assignment: hours,
                                }}
                                applicant={draggedApplicant}
                                key={"drop-target"}
                            />
                        );

                    if (!showHoursSubunits) {
                        // We should not show subunits
                        return (
                            <React.Fragment
                                key={`${position.position_code}-assignments`}
                            >
                                {pills}
                                {dropTarget}
                            </React.Fragment>
                        );
                    }
                    return (
                        <div
                            className="row-division"
                            onDragOver={() => setTargetHours(hours)}
                            key={`${position.position_code}-hours-${hours}`}
                        >
                            <div className="row-division-header">
                                {hours} hours
                            </div>
                            <div className="row-division-body">
                                {pills}
                                {dropTarget}
                            </div>
                        </div>
                    );
                })}
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
        assignment.active_offer_status === "withdrawn" ||
        assignment.deleted
    );
}
