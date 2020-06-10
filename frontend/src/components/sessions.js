import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";

import { formatDate } from "../libs/utils";
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

function _formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.toDateString()} dsdsd`;
}

/**
 * A cell that renders editable rate information
 *
 * @param {*} props
 * @returns
 */
function EditableCell(title, value, onChange) {
    return (
        <EditableField title={title} value={value} onChange={onChange}>
            {value}
        </EditableField>
    );
    // const title = `Edit ${props.column.Header}`;
    // const { upsertInstructor, field } = props;
    // function onChange(newVal) {
    //     const applicantId = props.original.id;
    //     upsertInstructor({ id: applicantId, [field]: newVal });
    // }
}

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
    git;
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
