import React from "react";
import classNames from "classnames";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { round } from "../../../libs/utils";
import { PositionSummary } from "./types";
import { setSelectedMatchingPosition } from "./actions";
import { Form } from "react-bootstrap";

/**
 * A searchable list of position codes.
 */
export function PositionList({
    selectedPositionId,
    positionSummaries,
}: {
    selectedPositionId: number | null;
    positionSummaries: PositionSummary[];
}) {
    const [filterString, setFilterString] = React.useState("");
    const filteredList = React.useMemo(() => {
        const ret: PositionSummary[] = positionSummaries
            .filter(
                (summary) =>
                    summary.position.position_code
                        .toLowerCase()
                        .indexOf(filterString.toLowerCase()) !== -1
            )
            .sort((a, b) => {
                return a.position.position_code.toLowerCase() <
                    b.position.position_code.toLowerCase()
                    ? -1
                    : 1;
            });
        return ret;
    }, [filterString, positionSummaries]);

    return (
        <div className="position-sidebar">
            <div className="search-container position-search">
                <Form inline onSubmit={(e) => e.preventDefault()}>
                    <Form.Control
                        type="text"
                        placeholder="Filter by position code..."
                        style={{ width: "100%" }}
                        className="mr-sm-2"
                        onChange={(e) => setFilterString(e.target.value)}
                    />
                </Form>
            </div>
            <div className="position-list">
                {filteredList.map((summary) => (
                    <PositionRow
                        positionSummary={summary}
                        focused={summary?.position.id === selectedPositionId}
                        key={summary.position.id}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * A single row in a list of positions displaying information about
 * how many hours have been assigned and how close it is to being complete.
 */
function PositionRow({
    positionSummary,
    focused,
}: {
    positionSummary: PositionSummary;
    focused: boolean;
}) {
    const dispatch = useThunkDispatch();
    const targetHours = round(
        positionSummary.position.hours_per_assignment *
            (positionSummary.position.desired_num_assignments || 0),
        2
    );

    const progress = React.useMemo(() => {
        if (["over", "matched"].includes(positionSummary.filledStatus)) {
            return 100;
        } else if (positionSummary.filledStatus === "under") {
            return round(
                (positionSummary.hoursAssigned / targetHours) * 100,
                0
            );
        }

        return 0;
    }, [positionSummary, targetHours]);

    return (
        <div
            className={classNames(
                "position-row",
                "noselect",
                positionSummary.filledStatus,
                { selected: focused }
            )}
            onClick={() =>
                dispatch(
                    setSelectedMatchingPosition(positionSummary.position.id)
                )
            }
        >
            <div
                className={`status-sidebar ${positionSummary.filledStatus}`}
            ></div>
            <div className="position-row-body">
                <div className="position-row-background">
                    <div
                        style={{ width: `${progress}%` }}
                        className={`progress ${positionSummary.filledStatus}`}
                    ></div>
                </div>
                <div className="position-row-info">
                    <span className="position-title">
                        {positionSummary.position.position_code}
                    </span>
                    <span className="position-hours-filled">
                        {positionSummary.hoursAssigned} / {targetHours} h
                    </span>
                    {focused && (
                        <span className="position-row-detail">
                            {positionSummary.applicantSummaries.length}{" "}
                            applicant
                            {positionSummary.applicantSummaries.length === 1
                                ? ""
                                : "s"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
