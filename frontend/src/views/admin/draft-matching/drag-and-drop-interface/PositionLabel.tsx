import { Position } from "../../../../api/defs/types";
import React from "react";
import { Button } from "react-bootstrap";
import classNames from "classnames";
import {
    AssignmentDraft,
    activePositionCodesSelector,
    draftMatchingSlice,
} from "../state/slice";
import { useSelector } from "react-redux";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

/**
 * Display information about a position in the list of positions.
 */
export function PositionLabel({
    positionSummary,
}: {
    positionSummary: {
        position: Position;
        assignments: AssignmentDraft[];
    };
}) {
    const dispatch = useThunkDispatch();
    const activePositionCodes = useSelector(activePositionCodesSelector);
    const isActive = activePositionCodes.includes(
        positionSummary.position.position_code
    );

    const targetHours = Math.round(
        positionSummary.position.hours_per_assignment *
            (positionSummary.position.desired_num_assignments || 0)
    );

    const hoursFilled = positionSummary.assignments
        .map((a) => a.hours)
        .reduce((a, b) => a + b, 0);

    const filledStatus =
        Math.abs(hoursFilled - targetHours) < 1
            ? "matched"
            : hoursFilled > targetHours
            ? "over"
            : "under";

    const progress = React.useMemo(() => {
        if (["over", "matched"].includes(filledStatus)) {
            return 100;
        } else if (filledStatus === "under") {
            return Math.round((hoursFilled / targetHours) * 100);
        }
        return 0;
    }, [hoursFilled, targetHours, filledStatus]);

    return (
        <Button
            bsPrefix="position-row"
            className={classNames("position-row", filledStatus, {
                "active-position": isActive,
            })}
            title={`${positionSummary.position.position_code}\n${hoursFilled} / ${targetHours} hours filled\n${positionSummary.assignments.length} TAs assigned\nDefault assignment is ${positionSummary.position.hours_per_assignment} hours per TA`}
            onClick={() => {
                if (!isActive) {
                    dispatch(
                        draftMatchingSlice.actions.addActivePositionCode(
                            positionSummary.position.position_code
                        )
                    );
                } else {
                    dispatch(
                        draftMatchingSlice.actions.removeActivePositionCode(
                            positionSummary.position.position_code
                        )
                    );
                }
            }}
        >
            <div className="position-row-background">
                <div
                    style={{ width: `${progress}%` }}
                    className={`progress ${filledStatus}`}
                ></div>
            </div>
            <div className="position-row-content">
                <div className="position-row-info">
                    <span className="position-title">
                        {positionSummary.position.position_code}
                    </span>
                    <span className="position-hours-filled">
                        {hoursFilled} / {targetHours} h
                    </span>
                </div>
            </div>
            <div className="position-row-content">
                <div className="position-row-info">
                    <div>
                        Hours: {positionSummary.position.hours_per_assignment}
                    </div>
                    <div>
                        Filled: {positionSummary.assignments.length} /{" "}
                        {positionSummary.position.desired_num_assignments ||
                            "?"}
                    </div>
                </div>
            </div>
        </Button>
    );
}
