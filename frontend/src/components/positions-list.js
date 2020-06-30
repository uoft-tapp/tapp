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
        Header: "Contract Template",
        accessor: "contract_template.template_name",
    },
];
function getPreferenceLevelColor(preferenceLevel) {
    return ["danger", "warning", "primary", "info", "success"][
        preferenceLevel + 1
    ];
}
const ADVANCED_COLUMNS = [
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
                            {name}
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
        Header: "Enrollment",
        accessor: "current_enrollment",
        Cell: (row) => {
            console.log("row", row);
            const na = "N/A";
            const {
                current_enrollment = na,
                current_waitlisted = na,
                id,
            } = row.row;

            return (
                <React.Fragment>
                    <p key={id}>
                        Enrolled: {current_enrollment} Waitlisted:{" "}
                        {current_waitlisted}
                    </p>
                </React.Fragment>
            );
        },
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
    const { positions, columns = DEFAULT_COLUMNS, view } = props;
    if (view === "advanced") columns.concat(ADVANCED_COLUMNS);
    console.log(positions);
    return (
        <React.Fragment>
            <h3>Positions</h3>
            <ReactTable
                data={positions}
                columns={
                    view === "advanced"
                        ? columns.concat(ADVANCED_COLUMNS)
                        : columns
                }
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
