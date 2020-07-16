import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { useSelector, useDispatch } from "react-redux";
import { sessionsSelector, upsertSession } from "../api/actions";
import { EditableField } from "../components/edit-field-widgets";
import { formatDate } from "../libs/utils";

/**
 * A cell that renders editable session information
 * @param {type: ["date", "text"]} props
 */
function EditableCell(props) {
    const title = `Edit ${props.column.Header}`;
    const { upsertSession, field, type, value } = props;
    const isDate = type === "date";
    function onChange(newVal) {
        const sessionId = props.original.id;
        upsertSession({ id: sessionId, [field]: newVal });
    }

    return (
        <EditableField
            title={title}
            value={value || ""}
            onChange={onChange}
            type={type}
        >
            {isDate ? formatDate(value) : value}
        </EditableField>
    );
}

/**
 * List the sessions using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{columns: object[]}} props
 * @returns
 */
export function SessionsList(props) {
    const sessions = useSelector(sessionsSelector);
    const dispatch = useDispatch();

    function _upsertSession(session) {
        return dispatch(upsertSession(session));
    }

    function generateCell(field, type) {
        return (props) => (
            <EditableCell
                field={field}
                upsertSession={_upsertSession}
                type={type}
                {...props}
            />
        );
    }

    const DEFAULT_COLUMNS = [
        {
            Header: "Name",
            accessor: "name",
            Cell: generateCell("name"),
        },
        {
            Header: "Start",
            accessor: "start_date",
            Cell: generateCell("start_date", "date"),
        },
        {
            Header: "End",
            accessor: "end_date",
            Cell: generateCell("end_date", "date"),
        },
        {
            Header: "Rate (Pre-January)",
            accessor: "rate1",
            Cell: generateCell("rate1"),
        },
        {
            Header: "Rate (Post-January)",
            accessor: "rate2",
            Cell: generateCell("rate2"),
        },
    ];

    const { columns = DEFAULT_COLUMNS } = props;
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
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};
