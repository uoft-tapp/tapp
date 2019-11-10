import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { Dropdown } from "react-bootstrap";
import { FilterableMenu } from "./filterable-menu";
import { docApiPropTypes } from "../api/defs/doc-generation";

/**
 * Displays and selects a session
 *
 * @export
 * @param {*} props
 * @returns
 */
export function SessionSelect(props) {
    const { sessions, activeSession, setActiveSession } = props;
    // keep track of the dropdown visibility so that the filter can be cleared
    // whenever the dropdown is invisible.
    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const activeSessionId = (activeSession || {}).id;
    const label = !activeSessionId ? (
        <span className="text-secondary mr-2">Select a Session</span>
    ) : (
        <span className="text-primary mr-2">{activeSession.name}</span>
    );
    return (
        <div>
            <h3>Select Session</h3>
            <Dropdown
                onSelect={i => {
                    setActiveSession(sessions[i]);
                }}
                onToggle={desiredVisibility =>
                    setDropdownVisible(desiredVisibility)
                }
                show={dropdownVisible}
            >
                <Dropdown.Toggle split variant="light">
                    {label}
                </Dropdown.Toggle>
                <FilterableMenu
                    items={sessions}
                    activeItemId={activeSessionId}
                    clearFilter={!dropdownVisible}
                />
            </Dropdown>
        </div>
    );
}
SessionSelect.propTypes = {
    setActiveSession: PropTypes.func.isRequired,
    sessions: PropTypes.array.isRequired,
    activeSession: PropTypes.object
};

const DEFAULT_COLUMNS = [
    { Header: "Name", accessor: "name" },
    { Header: "Start", accessor: "start_date" },
    { Header: "End", accessor: "end_date" },
    { Header: "Rate (Pre-January)", accessor: "rate1" },
    { Header: "Rate (Post-January)", accessor: "rate2" }
];

/**
 * List the sessions using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{sessions: object[], columns: object[]}} props
 * @returns
 */
export function SessionsList(props) {
    const { sessions, columns = DEFAULT_COLUMNS } = props;
    return (
        <React.Fragment>
            <h3>Sessions</h3>
            <ReactTable
                data={sessions}
                columns={columns}
                showPagination={false}
                minRows={1}
            />
        </React.Fragment>
    );
}
SessionsList.propTypes = {
    sessions: PropTypes.arrayOf(docApiPropTypes.session).isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    )
};
