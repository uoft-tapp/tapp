import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "../libs/utils";
import { createDiffColumnsFromColumns } from "./diff-table";
import { AdvancedFilterTable } from "./filter-table/advanced-filter-table";
import { Assignment, MinimalAssignment } from "../api/defs/types";
import { CellProps } from "react-table";
import { DiffSpec } from "../libs/diffs";

const DEFAULT_COLUMNS: any[] = [
    { Header: "Last Name", accessor: "applicant.last_name" },
    { Header: "First Name", accessor: "applicant.first_name" },
    { Header: "Position Code", accessor: "position.position_code" },
    { Header: "Hours", accessor: "hours", className: "number-cell" },
    {
        Header: "Start",
        accessor: "start_date",
        Cell: (row: CellProps<Assignment>) => formatDate(row.value) || "",
    },
    {
        Header: "End",
        accessor: "end_date",
        Cell: (row: CellProps<Assignment>) => formatDate(row.value) || "",
    },
];

/**
 * Display a DiffSpec array of assignments and highlight the changes.
 *
 * @export
 * @param {*} { modifiedInstructors }
 * @returns
 */
export function AssignmentsDiffList({
    modifiedAssignments,
}: {
    modifiedAssignments: DiffSpec<MinimalAssignment, Assignment>[];
}) {
    return (
        <AssignmentsList
            assignments={modifiedAssignments as any[]}
            columns={createDiffColumnsFromColumns(DEFAULT_COLUMNS)}
        />
    );
}

function AssignmentsList(props: {
    assignments: (Assignment | Omit<Assignment, "id">)[];
    columns?: any[];
}) {
    const { assignments, columns = DEFAULT_COLUMNS } = props;
    return <AdvancedFilterTable data={assignments} columns={columns} />;
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
