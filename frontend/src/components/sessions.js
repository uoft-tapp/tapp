import React from "react";
import PropTypes from "prop-types";
import { docApiPropTypes } from "../api/defs/doc-generation";
import ReactTable from "react-table";
import { connect } from "react-redux";
import { sessionsSelector, upsertSession } from "../api/actions";
import { EditableField } from "../components/edit-field-widgets";
import { formatDate } from "../libs/utils";

/**
 * A cell that renders editable session information
 * @param {} props
 */
function EditableCell(props) {
    const title = `Edit ${props.column.Header}`;
    const { upsertSession, field } = props;
    function onChange(newVal) {
        const sessionId = props.original.id;
        upsertSession({ id: sessionId, [field]: newVal });
    }

    return (
        <EditableField
            title={title}
            value={props.value || ""}
            onChange={onChange}
        >
            {props.value}
        </EditableField>
    );
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
        {
            Header: "Rate (Pre-January)",
            accessor: "rate1",
            Cell: (props) => (
                <EditableCell
                    field="rate1"
                    upsertSession={upsertSession}
                    {...props}
                />
            ),
        },
        {
            Header: "Rate (Post-January)",
            accessor: "rate2",
            Cell: (props) => (
                <EditableCell
                    field="rate2"
                    upsertSession={upsertSession}
                    {...props}
                />
            ),
        },
    ];

    const { sessions, upsertSession, columns = DEFAULT_COLUMNS } = props;
    return (
        <ReactTable
            data={sessions}
            columns={columns}
            showPagination={false}
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

export const ConnectedSessionsList = connect(
    (state) => ({
        sessions: sessionsSelector(state),
    }),
    { upsertSession }
)(SessionsList);
