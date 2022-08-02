import React from "react";
import { Form } from "react-bootstrap";
import { PositionSummary } from "./types";
import { round } from "../../../libs/utils";

import "./styles.css";

/**
 * A row in the list of positions displaying information about
 * how many hours have been assigned and how close it is to being complete.
 *
 * @param {*} props
 * @returns
 */
function PositionRow({
    positionSummary,
    focused,
    setSelectedPosition,
}: {
    positionSummary: PositionSummary;
    focused: boolean;
    setSelectedPosition: Function;
}) {
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
                setSelectedPosition(positionSummary);
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

/**
 * A searchable list of position codes.
 *
 * @param {*} props
 * @returns
 */
export function PositionList({
    currPosition,
    summaries,
    setSelectedPosition,
}: {
    currPosition: PositionSummary | null;
    summaries: Record<number, PositionSummary>;
    setSelectedPosition: Function;
}) {
    // Either display the list of all courses or focus on the currently-selected on
    const [searchValue, setSearchValue] = React.useState("");

    const filteredList = React.useMemo(() => {
        const ret: PositionSummary[] = Object.values(summaries)
            .filter((summary) =>
                summary.position.position_code
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
            )
            .sort((a, b) => {
                return a.position.position_code.toLowerCase() <
                    b.position.position_code.toLowerCase()
                    ? -1
                    : 1;
            });
        return ret;
    }, [searchValue, summaries]);

    return (
        <div className="position-sidebar">
            <div className="search-container position-search">
                <Form inline>
                    <Form.Control
                        type="text"
                        placeholder="Filter by position code..."
                        style={{ width: "100%" }}
                        className="mr-sm-2"
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </Form>
            </div>
            <div className="position-list">
                {filteredList.map((summary) => (
                    <PositionRow
                        positionSummary={summary}
                        focused={
                            summary?.position.id === currPosition?.position.id
                        }
                        setSelectedPosition={setSelectedPosition}
                        key={summary.position.id}
                    />
                ))}
            </div>
        </div>
    );
}
