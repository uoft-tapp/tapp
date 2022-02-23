import classNames from "classnames";
import React from "react";
import { useSelector } from "react-redux";
import { assignmentsSelector, positionsSelector } from "../../../api/actions";
import { Assignment, Position } from "../../../api/defs/types";
import { sum } from "../../../api/mockAPI/utils";
import { round } from "../../../libs/utils";
import { ApplicantPill } from "./applicant-pill";

import "./grouped-overview.css";

type PositionSummary = {
    assignments: Assignment[];
    numActiveAssignments: number;
    hoursAssigned: number;
    filledStatus: "under" | "over" | "matched";
};

function PositionLabel({
    position,
    summary,
}: {
    position: Position;
    summary: PositionSummary;
}) {
    const targetHours = round(
        position.hours_per_assignment * (position.desired_num_assignments || 0),
        2
    );

    return (
        <div className={classNames("position-label", summary.filledStatus)}>
            <span className="position-code">{position.position_code}</span>
            <div className="additional-info">
                <span className="position-hours">
                    {position.hours_per_assignment}
                </span>
                <span className="position-filled">
                    {summary.numActiveAssignments}
                    {position.desired_num_assignments != null ? "/" : ""}
                    {position.desired_num_assignments}
                </span>
                <span className="position-hours-filled">
                    {summary.hoursAssigned}/{targetHours}
                </span>
            </div>
        </div>
    );
}

function PositionRow({
    position,
    summary,
}: {
    position: Position;
    summary: PositionSummary;
}) {
    const activeAssignments = React.useMemo(() => {
        return summary.assignments.filter((assignment) =>
            ["accepted", "provisional", "pending"].includes(
                assignment.active_offer_status || ""
            )
        );
    }, [summary]);
    const assignmentsByHours = React.useMemo(() => {
        const indexedByHours: Record<number, Assignment[]> = {};
        for (const assignment of activeAssignments) {
            indexedByHours[assignment.hours] =
                indexedByHours[assignment.hours] || [];
            indexedByHours[assignment.hours].push(assignment);
        }

        for (const assignments of Object.values(indexedByHours)) {
            assignments.sort((a, b) => {
                const aName = `${a.applicant.last_name}, ${a.applicant.first_name}`;
                const bName = `${b.applicant.last_name}, ${b.applicant.first_name}`;
                return aName.localeCompare(bName);
            });
        }

        const ret = Object.entries(indexedByHours);
        // The list should be sorted so that the "default assignment" appears first
        // and all other assignments are sorted numerically.
        ret.sort(([_hours_a, assignments_a], [_hours_b, assignments_b]) => {
            const hours_a = +_hours_a;
            const hours_b = +_hours_b;

            if (hours_a === position.hours_per_assignment) {
                return 1;
            }
            if (hours_a > hours_b) {
                return 1;
            } else if (hours_a < hours_b) {
                return -1;
            }
            return 0;
        });
        return ret;
    }, [activeAssignments, position.hours_per_assignment]);

    return (
        <div className="position-row">
            <PositionLabel position={position} summary={summary} />
            <div className="position-row-body">
                {assignmentsByHours.map(([_hours, assignments], i) => {
                    const hours = +_hours;
                    return (
                        <div className="row-division" key={i}>
                            <div className="row-division-header">
                                {round(hours, 2)} hours
                            </div>
                            <div className="row-division-body">
                                {assignments.map((assignment, i) => (
                                    <ApplicantPill
                                        applicant={assignment.applicant}
                                        key={i}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function GroupedOverview() {
    const positions = useSelector(positionsSelector);
    const assignments = useSelector(assignmentsSelector);
    const positionSummaries = React.useMemo(() => {
        const assignmentsByPositionId: Record<number, Assignment[]> = {};
        for (const assignment of assignments) {
            assignmentsByPositionId[assignment.position.id] =
                assignmentsByPositionId[assignment.position.id] || [];
            assignmentsByPositionId[assignment.position.id].push(assignment);
        }

        const ret: Record<number, PositionSummary> = {};
        for (const position of positions) {
            const assignmentsForPosition =
                assignmentsByPositionId[position.id] || [];
            const activeAssignments = assignmentsForPosition.filter(
                (assignment) =>
                    ["accepted", "provisional", "pending"].includes(
                        assignment.active_offer_status || ""
                    )
            );
            const targetHours = round(
                position.hours_per_assignment *
                    (position.desired_num_assignments || 0),
                2
            );
            const hoursAssigned = round(
                sum(...activeAssignments.map((assignment) => assignment.hours)),
                2
            );
            let filledStatus: "under" | "over" | "matched" = "under";
            if (hoursAssigned - targetHours > 2) {
                filledStatus = "over";
            } else if (hoursAssigned - targetHours > -2) {
                filledStatus = "matched";
            }

            ret[position.id] = {
                assignments: assignmentsByPositionId[position.id] || [],
                numActiveAssignments: activeAssignments.length,
                hoursAssigned,
                filledStatus,
            };
        }
        return ret;
    }, [positions, assignments]);

    return (
        <div className="assignments-summary">
            {positions.map((position) => (
                <PositionRow
                    position={position}
                    summary={positionSummaries[position.id]}
                    key={position.id}
                />
            ))}
        </div>
    );
}
