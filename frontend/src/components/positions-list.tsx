import React from "react";
import PropTypes from "prop-types";
import { Badge } from "react-bootstrap";
import { formatDate } from "../libs/utils";
import { createDiffColumnsFromColumns } from "./diff-table";
import { generateHeaderCell } from "./table-utils";
import { AdvancedFilterTable } from "./filter-table/advanced-filter-table";
import { Instructor, MinimalPosition, Position } from "../api/defs/types";
import { Cell, Column } from "react-table";
import { DiffSpec } from "../libs/diffs";

const DEFAULT_COLUMNS: (Column<any> & {
    className?: string;
    accessor?: string;
})[] = [
    { Header: generateHeaderCell("Position Code"), accessor: "position_code" },
    {
        Header: generateHeaderCell("Position Title"),
        accessor: "position_title",
    },
    {
        Header: generateHeaderCell("Hours"),
        accessor: "hours_per_assignment",
        maxWidth: 64,
        className: "number-cell",
    },
    {
        Header: generateHeaderCell("Start"),
        accessor: "start_date",
        Cell: (row: Cell<Position>) => formatDate(row.value),
    },
    {
        Header: generateHeaderCell("End"),
        accessor: "end_date",
        Cell: (row: Cell<Position>) => formatDate(row.value),
    },
    {
        Header: generateHeaderCell("Instructors"),
        accessor: "instructors",
        Cell: (props: Cell<Position, Instructor[]>) => (
            <React.Fragment>
                {props.value.map((instructor: Instructor = {} as any) => {
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
        Header: generateHeaderCell("Enrolled"),
        accessor: "current_enrollment",
        maxWidth: 80,
    },
    {
        Header: generateHeaderCell("Waitlist"),
        accessor: "current_waitlisted",
        maxWidth: 90,
    },

    {
        Header: generateHeaderCell("Contract Template"),
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
export function PositionsDiffList({
    modifiedPositions,
}: {
    modifiedPositions: DiffSpec<MinimalPosition, Position>[];
}) {
    return (
        <PositionsList
            positions={modifiedPositions}
            columns={createDiffColumnsFromColumns<Position>(
                DEFAULT_COLUMNS as any[]
            )}
        />
    );
}

/**
 * List the instructors using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 */
export function PositionsList(props: {
    positions:
        | Position[]
        | Omit<Position, "id">[]
        | DiffSpec<MinimalPosition, Position>[];
    columns?: Column<any>[];
}) {
    const { positions, columns = DEFAULT_COLUMNS } = props;
    return (
        <AdvancedFilterTable
            columns={columns}
            data={positions}
            filterable={true}
        />
    );
}
PositionsList.propTypes = {
    positions: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};
