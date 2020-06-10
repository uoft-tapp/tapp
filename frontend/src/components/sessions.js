import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";

// import { fieldEditorFactory } from './common-controls'
import { EditableField } from "./edit-field-widgets";

const DEFAULT_COLUMNS = [
    { Header: "Name", accessor: "name" },
    { Header: "Start", accessor: "start_date" },
    {
        Header: "End", accessor: "end_date"
    },
    { Header: "Rate (Pre-January)", accessor: "rate1" },
    { Header: "Rate (Post-January)", accessor: "rate2" },
];

function _formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", { month: 'long', year: 'numeric', day: 'numeric' })}`;
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
    console.log(sessions);
    const formattedSessions =
        sessions.length > 0
            ? sessions.map((session) => ({
                ...session,
                start_date: _formatDate(session.start_date),
                end_date: _formatDate(session.end_date),
                rate1: EditableCell(
                    "Rate (pre-January)",
                    session.rate1,
                    undefined
                ),
                rate2: EditableCell(
                    "Rate (post-January)",
                    session.rate2,
                    undefined
                ),
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
