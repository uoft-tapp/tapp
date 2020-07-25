import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";

import { formatDate } from "../libs/utils";
import { Alert } from "react-bootstrap";
const DEFAULT_COLUMNS = [
    { Header: "Name", accessor: "name" },
    {
        Header: "Start",
        accessor: "start_date",
        Cell: (row) => formatDate(row.value),
    },
    {
        Header: "End",
        accessor: "end_date",
        Cell: (row) => formatDate(row.value),
    },
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
    const pageSize = sessions?.length || 20;
    return (
        <ReactTable
            data={sessions}
            columns={columns}
            showPagination={false}
            defaultPageSize={pageSize}
            minRows={1}
        />
    );
}
SessionsList.propTypes = {
    sessions: PropTypes.arrayOf(docApiPropTypes.session).isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};

export function MissingActiveSessionWarning({ extraText = "" }) {
    return (
        <Alert variant="info">
            There is no active session selected. {extraText}
        </Alert>
    );
}
