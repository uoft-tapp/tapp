import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { Badge } from "react-bootstrap";
import { formatDate } from "../libs/utils";
import { createDiffColumnsFromColumns } from "./diff-table";

const DEFAULT_COLUMNS = [
    { Header: "Position Code", accessor: "position_code" },
    { Header: "Position Title", accessor: "position_title" },
    { Header: "Hours", accessor: "hours_per_assignment", maxWidth: 64 },
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
        Header: "Instructors",
        accessor: "instructors",
        Cell: (props) => (
            <React.Fragment>
                {props.value.map((instructor = {}) => {
                    const name = `${instructor.first_name} ${instructor.last_name}`;
                    return (
                        <Badge variant="secondary" className="mr-1" key={name}>
                            {name}
                        </Badge>
                    );
                })}
            </React.Fragment>
        ),
    },
    {
        Header: "Enrolled",
        accessor: "current_enrollment",
        maxWidth: 80,
    },
    {
        Header: "Waitlisted",
        accessor: "current_waitlisted",
        maxWidth: 90,
    },

    {
        Header: "Contract Template",
        accessor: "contract_template.template_name",
    },
];

/**
 * Display a DiffSpec array of positions and highlight the changes.
 *
 * @export
 * @param {*} { modifiedInstructors }
 * @returns
 */
export function PositionsDiffList({ modifiedPositions }) {
    return (
        <PositionsList
            positions={modifiedPositions}
            columns={createDiffColumnsFromColumns(DEFAULT_COLUMNS)}
        />
    );
}

/**
 * List the instructors using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{instructors: object[], columns: object[]}} props
 * @returns
 */
export function PositionsList(props) {
    const { positions, columns = DEFAULT_COLUMNS } = props;
    const pageSize = positions?.length || 20;
    return (
        <ReactTable
            data={positions}
            columns={columns}
            showPagination={false}
            defaultPageSize={pageSize}
            pageSize={pageSize}
            minRows={1}
        />
    );
}
PositionsList.propTypes = {
    positions: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};
