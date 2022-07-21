import React from "react";
import classNames from "classnames";

import { FaFilter } from "react-icons/fa";
import { Form } from "react-bootstrap";

import { PositionSummary } from "./types";
import { round } from "../../../libs/utils";

import "./styles.css";

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

    let backgroundStyle = "";

    switch (positionSummary.filledStatus) {
        case "over":
            backgroundStyle = "rgba(0, 229, 243, 0.15)";
            break;
        case "matched":
            backgroundStyle = "rgba(0, 193, 43, 0.15)";
            break;
        case "under":
            let percentage = round(
                (positionSummary.hoursAssigned / targetHours) * 100,
                0
            );
            backgroundStyle =
                "-webkit-linear-gradient(left, rgba(255, 204, 22, 0.15) " +
                percentage +
                "%, #fff " +
                percentage +
                "%, #fff 100%)";
            break;
        default:
            break;
    }

    return (
        <div
            style={{ background: backgroundStyle }}
            className={classNames("position-row", "noselect")}
            onClick={() => {
                setSelectedPosition(positionSummary);
                // TODO: if focused, show detailed info about this position
            }}
        >
            <div
                className={classNames("status-sidebar", positionSummary.filledStatus)}
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
    // const [showDetail, setShowDetail] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [positionFilters, setPositionFilters] = React.useState([]);

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
                <div className="filter-button-container">
                    <FaFilter className="filter-button" />
                </div>
            </div>
            <div className="position-list">
                {filteredList.map((summary) => (
                    <PositionRow
                        positionSummary={summary}
                        focused={summary === currPosition}
                        setSelectedPosition={setSelectedPosition}
                        key={summary.position.id}
                    />
                ))}
            </div>
        </div>
    );
}
