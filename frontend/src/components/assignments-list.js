import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "../libs/utils";
import ReactTable from "react-table";
import { createDiffColumnsFromColumns } from "./diff-table";

const DEFAULT_COLUMNS = [
    { Header: "Last Name", accessor: "applicant.last_name" },
    { Header: "First Name", accessor: "applicant.first_name" },
    { Header: "Position Code", accessor: "position.position_code" },
    { Header: "Hours", accessor: "hours", className: "number-cell" },
    {
        Header: "Start",
        accessor: "start_date",
        Cell: (row) => formatDate(row.value) || "",
    },
    {
        Header: "End",
        accessor: "end_date",
        Cell: (row) => formatDate(row.value) || "",
    },
];

/**
 * Display a DiffSpec array of positions and highlight the changes.
 *
 * @export
 * @param {*} { modifiedInstructors }
 * @returns
 */
export function AssignmentsDiffList({ modifiedAssignments }) {
    return (
        <AssignmentsList
            assignments={modifiedAssignments}
            columns={createDiffColumnsFromColumns(DEFAULT_COLUMNS)}
        />
    );
}

function AssignmentsList(props) {
    const { assignments, columns = DEFAULT_COLUMNS } = props;
    const pageSize = assignments?.length || 20;
    return (
        <React.Fragment>
            <h3>Assignments</h3>
            <ReactTable
                data={assignments}
                columns={columns}
                showPagination={false}
                defaultPageSize={pageSize}
                pageSize={pageSize}
                minRows={1}
            />
        </React.Fragment>
    );
}
AssignmentsList.propTypes = {
    assignments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            position: PropTypes.object,
            applicant: PropTypes.object,
        })
    ).isRequired,
};

export { AssignmentsList };
