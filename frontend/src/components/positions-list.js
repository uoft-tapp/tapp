import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";
import { Badge } from "react-bootstrap";
import { formatDate, formatColumnName } from "../libs/utils";

const ALL_COLUMNS = [
    {
        Header: "ID",
        accessor: "id",
    },
    {
        Header: "Position Code",
        accessor: "position_code",
    },
    {
        Header: "Position Title",
        accessor: "position_title",
    },
    {
        Header: "Hours Per Assignment",
        accessor: "hours_per_assignment",
    },
    {
        Header: "Start Date",
        accessor: "start_date",
        Cell: (row) => formatDate(row.value),
    },
    {
        Header: "End Date",
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
        Header: "Contract Template",
        accessor: "contract_template.template_name",
    },
    {
        Header: "Duties",
        accessor: "duties",
    },
    {
        Header: "Instructor Preferences",
        accessor: "instructor_preferences",
        Cell: (props) => (
            <React.Fragment>
                {props.value.map((preference = {}, index) => {
                    const name = `${preference.instructor.first_name} ${preference.instructor.last_name}`;
                    return (
                        <Badge
                            variant={getPreferenceLevelColor(
                                preference.preference_level
                            )}
                            className="mr-1"
                            key={`${name}-${index}`}
                        >
                            {name}: {preference.preference_level}
                        </Badge>
                    );
                })}
            </React.Fragment>
        ),
    },
    {
        Header: "Qualifications",
        accessor: "qualifications",
    },
    {
        Header: "Current Enrollment",
        accessor: "current_enrollment",
    },
    {
        Header: "Current Waitlisted",
        accessor: "current_waitlisted",
    },
    {
        Header: "Ad Hours Per Assignment",
        accessor: "ad_hours_per_assignment",
    },
    {
        Header: "Ad Number of Assignments",
        accessor: "ad_num_assignments",
    },
    {
        Header: "Ad Open Date",
        accessor: "ad_open_date",
        Cell: (row) => (row.value ? formatDate(row.value) : ""),
    },
    {
        Header: "Ad Close Date",
        accessor: "ad_close_date",
        Cell: (row) => (row.value ? formatDate(row.value) : ""),
    },
    {
        Header: "Desired Number of Assignments",
        accessor: "desired_num_assignments",
    },
    // TODO: probably missing some. compare with api docs for /get/position
];

function getPreferenceLevelColor(preferenceLevel) {
    return ["danger", "warning", "primary", "info", "success"][
        preferenceLevel + 1
    ];
}

function getCustomColumns(selectedColumns) {
    return ALL_COLUMNS.filter((column) =>
        selectedColumns.has(formatColumnName(column.accessor))
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
    const { positions, selectedColumns } = props;
    return (
        <React.Fragment>
            <h3>Positions</h3>
            <ReactTable
                data={positions}
                columns={getCustomColumns(selectedColumns)}
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
