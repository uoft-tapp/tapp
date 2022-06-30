import React from "react";
import classNames from "classnames";

import { FaFilter } from "react-icons/fa";
import { Form } from "react-bootstrap";

import { PositionSummary } from "./types";
import { round } from "../../../libs/utils";

import "./styles.css";

function PositionRow({
    summary,
    isFocus,
    setSelectedPosition
}: {
    summary: PositionSummary;
    isFocus: boolean;
    setSelectedPosition: Function
}) {
    const targetHours = round(
        summary.position.hours_per_assignment * (summary.position.desired_num_assignments || 0),
        2
    );

    let backgroundStyle = '';

    switch(summary.filledStatus) {
        case 'over':
            backgroundStyle = 'rgba(0, 229, 243, 0.15)';
            break;
        case 'matched':
            backgroundStyle = 'rgba(0, 193, 43, 0.15)';
            break;
        case 'under':
            let percentage = round(summary.hoursAssigned / targetHours * 100, 0);
            backgroundStyle = '-webkit-linear-gradient(left, rgba(255, 204, 22, 0.15) ' + percentage + '%, #fff ' + percentage + '%, #fff 100%)';
            break;
        default:
            break;
    };

    return (
        <div 
            style={{"background": backgroundStyle}} 
            className={classNames("position-row", "noselect")} 
            onClick={() => { setSelectedPosition(summary); } }
        >
            <div className={classNames("status-sidebar", summary.filledStatus)}></div>
            <span className="position-title">{summary.position.position_code}</span>
            <span className="position-hours-filled">{summary.hoursAssigned}/{targetHours}</span>
        </div>
    );
};

export function PositionList({
    currPosition,
    summaries,
    onClick
}: {
    currPosition: PositionSummary | null;
    summaries: Record<number, PositionSummary>;
    onClick: Function;
}) {
    // Either display the list of all courses or focus on the currently-selected on
    // const [showDetail, setShowDetail] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [positionFilters, setPositionFilters] = React.useState([]);

    const filteredList = React.useMemo(() => {
        const ret: PositionSummary[] = Object.values(summaries)
            .filter(
                (summary) => summary.position.position_code.toLowerCase().includes(searchValue.toLowerCase())
            )
            .sort((a, b) => {
                return (a.position.position_code.toLowerCase() < b.position.position_code.toLowerCase())
                    ? -1
                    : 1;
            });
        return ret;
    }, [searchValue, summaries]);

    return (
        <div className="position-sidebar">
            <div className="search-container position-search">
                <Form inline>
                    <Form.Control type="text" placeholder="Search positions..." style={
                        {"width": "100%"}} className="mr-sm-2" onChange={
                            (e) => setSearchValue(e.target.value)
                        }/>
                </Form>
                <div className="filter-button-container">
                    <FaFilter className="filter-button" />
                </div>
            </div>
            <div className="position-list">
            { filteredList.map((summary) => (
                <PositionRow
                    summary={summary}
                    isFocus={summary === currPosition}
                    setSelectedPosition={onClick}
                    key={summary.position.id}
                />
            ))}
            </div>
        </div>
    );
}