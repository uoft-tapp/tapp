import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";

import { formatDate } from "../libs/utils"
const DEFAULT_COLUMNS = [
    { Header: "Name", accessor: "name" },
    { Header: "Start", accessor: "start_date" },
    { Header: "End", accessor: "end_date" },
    { Header: "Rate (Pre-January)", accessor: "rate1" },
    { Header: "Rate (Post-January)", accessor: "rate2" },
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
    const formattedSessions =
        sessions.length > 0
            ? sessions.map((session) => ({
                ...session,
                start_date: formatDate(session.start_date),
                end_date: formatDate(session.end_date)
            }))
            : sessions;

    return (
        <React.Fragment>
            <h3>Sessions</h3>
            <ReactTable
                data={formattedSessions}
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
    ),
};
