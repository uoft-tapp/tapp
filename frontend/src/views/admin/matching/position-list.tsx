import React from "react";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { round } from "../../../libs/utils";
import { PositionSummary } from "./types";
import { setSelectedPosition } from "./actions";
import { Form } from "react-bootstrap";

/**
 * A searchable list of position codes.
 */
export function PositionList({
    selectedPositionId,
    positionSummaries,
}: {
    selectedPositionId: number | null;
    positionSummaries: Record<number, PositionSummary>;
}) {
    const [filterString, setFilterString] = React.useState("");
    const filteredList = React.useMemo(() => {
        const ret: PositionSummary[] = Object.values(positionSummaries)
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
                <Form inline>
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

    // Overriding style specifically for under-assigned courses since we need a particular width
    let backgroundOverride = "";
    if (positionSummary.filledStatus === "under") {
        let percentage = round(
            (positionSummary.hoursAssigned / targetHours) * 100,
            0
        );
        backgroundOverride = `-webkit-linear-gradient(left, rgba(255, 204, 22, 0.15) ${percentage}%, #fff ${percentage}%, #fff 100%)`;
    }

    return (
        <div
            style={{ background: backgroundOverride }}
            className={`position-row noselect ${positionSummary.filledStatus}`}
            onClick={() => {
                dispatch(setSelectedPosition(positionSummary.position.id));
            }}
        >
            <div
                className={`status-sidebar ${positionSummary.filledStatus} ${
                    focused ? "selected" : ""
                }`}
            ></div>
            <span className="position-title">
                {positionSummary.position.position_code}
            </span>
            <span className="position-hours-filled">
                {positionSummary.hoursAssigned} / {targetHours} h
            </span>
        </div>
    );
}
