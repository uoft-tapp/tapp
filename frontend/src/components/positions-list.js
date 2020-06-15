import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";
import { Badge } from "react-bootstrap";
import { formatDate } from "../libs/utils";

const DEFAULT_COLUMNS = [
    { Header: "Position Code", accessor: "position_code" },
    { Header: "Position Title", accessor: "position_title" },
    { Header: "Hours", accessor: "hours_per_assignment" },
    { Header: "Start", accessor: "start_date" },
    { Header: "End", accessor: "end_date" },
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
        Header: "Contract Template",
        accessor: "contract_template.template_name",
    },
];

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
    const formattedPositions =
        positions.length > 0
            ? positions.map((position) => ({
                  ...position,
                  start_date: formatDate(position.start_date),
                  end_date: formatDate(position.end_date),
              }))
            : positions;
    return (
        <React.Fragment>
            <h3>Positions</h3>
            <ReactTable
                data={formattedPositions}
                columns={columns}
                showPagination={false}
                minRows={1}
            />
        </React.Fragment>
    );
}
PositionsList.propTypes = {
    positions: PropTypes.arrayOf(docApiPropTypes.position).isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};
