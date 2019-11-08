import React from "react";
import { connect } from "react-redux";
import {
    applicantsByPositionSelector,
    findPositionByIdSelector,
    changeInstructorPref,
    selectApplicant,
    removeApplicant
} from "../../../api/actions";
import { Button, Card, DropdownButton, Dropdown } from "react-bootstrap";
import ReactTable from "react-table";

const isAdmin = true;

const SelectButton = connect(
    null,
    { selectApplicant }
)(({ selectApplicant, positionId, applicantId }) => (
    <Button
        className="full-width"
        variant="outline-secondary"
        size="sm"
        onClick={() => selectApplicant({ positionId, applicantId })}
    >
        Select
    </Button>
));

const RemoveButton = connect(
    null,
    { removeApplicant }
)(({ removeApplicant, positionId, applicantId }) => (
    <Button
        className="full-width"
        variant="outline-secondary"
        size="sm"
        onClick={() => removeApplicant({ positionId, applicantId })}
    >
        Remove
    </Button>
));

const promoteColumn = {
    Header: "Select",
    id: "promote",
    Cell: ({ original: { applicantId, positionId } }) => {
        return (
            <SelectButton applicantId={applicantId} positionId={positionId} />
        );
    },
    filterable: false,
    sortable: false,
    resizeable: false,
    width: 90
};

const demoteColumn = {
    Header: "Remove",
    id: "demote",
    Cell: ({ original: { applicantId, positionId, locked } }) => {
        if (locked) {
            return (
                <Button
                    className="full-width"
                    variant="outline-secondary"
                    size="sm"
                    disabled
                >
                    <span className="fa fa-lock" /> Locked
                </Button>
            );
        }
        return (
            <RemoveButton applicantId={applicantId} positionId={positionId} />
        );
    },
    filterable: false,
    sortable: false,
    resizeable: false,
    width: 90
};

const instructorPrefOptions = [
    { label: "Top choice", value: 1 },
    { label: "Second choice", value: 2 },
    { label: "Pref not", value: -1 }
];

const InstructorPrefDropdown = connect(
    null,
    {
        changeInstructorPref
    }
)(
    ({
        changeInstructorPref,
        applicantId,
        positionId,
        instructorPref,
        title
    }) => (
        <DropdownButton title={title} className="instructor-pref-dropdown">
            {instructorPrefOptions.map(option => (
                <Dropdown.Item
                    active={option.value === instructorPref}
                    onSelect={() =>
                        changeInstructorPref({
                            applicantId,
                            positionId,
                            instructorPref: option.value
                        })
                    }
                >
                    {option.label}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    )
);

const instructorPrefColumn = {
    Header: "Instructor Preference",
    accessor: "instructor_pref",
    Cell: ({ original: { applicantId, positionId, instructor_pref } }) => {
        const selectedValue = instructorPrefOptions.find(option => {
            return option.value === instructor_pref;
        });

        return (
            <InstructorPrefDropdown
                applicantId={applicantId}
                positionId={positionId}
                instructorPref={instructor_pref}
                title={selectedValue ? selectedValue.label : "-"}
            />
        );
    },
    filterMethod: (filter, row) => {
        return (
            filter.value === "all" ||
            parseInt(filter.value, 10) === row["instructor_pref"]
        );
    },
    Filter: ({ filter, onChange }) => (
        <select
            className="full-width"
            onChange={event => onChange(event.target.value)}
            value={filter ? filter.value : "all"}
        >
            <option value="all">Show All</option>

            {instructorPrefOptions.forEach(option => (
                <option value={option.value} key={option.value}>{option.label}</option>
            ))}
        </select>
    )
};

const adminInstructorPrefColumn = {
    Header: "Instructor Preference",
    accessor: "instructor_pref",
    Cell: ({ original: { applicantId, positionId, instructor_pref } }) => {
        const selectedValue = instructorPrefOptions.find(option => {
            return option.value === instructor_pref;
        });

        return selectedValue ? selectedValue.label : "";
    },

    filterMethod: (filter, row) => {
        return (
            filter.value === "all" ||
            parseInt(filter.value, 10) === row["instructor_pref"]
        );
    },
    Filter: ({ filter, onChange }) => (
        <select
            className="full-width"
            onChange={event => onChange(event.target.value)}
            value={filter ? filter.value : "all"}
        >
            <option value="all">Show All</option>

            {instructorPrefOptions.map(option => (
                <option value={option.value} key={option.value}>{option.label}</option>
            ))}
        </select>
    )
};
const lastNameColumn = { Header: "Last Name", accessor: "last_name" };
const firstNameColumn = { Header: "First Name", accessor: "first_name" };
const departmentColumn = { Header: "Department", accessor: "department" };
const yearColumn = { Header: "Year", accessor: "year" };
const pereferenceColumn = { Header: "Preference", accessor: "preference" };

const programColumn = {
    Header: "Program",
    accessor: "program",
    filterMethod: (filter, row) => {
        if (filter.value === "not-undergrad") {
            return row[filter.id] !== "Undergrad";
        }
        return filter.value === "all" || filter.value === row[filter.id];
    },
    Filter: ({ filter, onChange }) => (
        <select
            className="full-width"
            onChange={event => onChange(event.target.value)}
            value={filter ? filter.value : "all"}
        >
            <option value="all">Show All</option>
            <option value="Undergrad">Undergrad</option>
            <option value="Graduate">Graduate</option>
            <option value="PostDoc">PostDoc</option>
            <option value="not-undergrad">Not Undergrad</option>
        </select>
    )
};

const otherColumn = {
    Header: "Other Assignments",
    accessor: "other",
    Cell: ({ value }) => <span>{value.join(", ")}</span>,
    filterMethod: (filter, row) => {
        if (filter.value === "assigned") {
            return row[filter.id].length > 0;
        } else if (filter.value === "unassigned") {
            return row[filter.id].length === 0;
        }
        return true;
    },
    Filter: ({ filter, onChange }) => (
        <select
            className="full-width"
            onChange={event => onChange(event.target.value)}
            value={filter ? filter.value : "all"}
        >
            <option value="all">Show All</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned Elsewhere</option>
        </select>
    )
};

const getTableCols = permissions => {
    const { isSelectedTable } = permissions;
    const instructorCols = [
        instructorPrefColumn,
        lastNameColumn,
        firstNameColumn,
        departmentColumn,
        programColumn,
        yearColumn,
        pereferenceColumn,
        otherColumn
    ];
    const adminAvailableCols = [
        promoteColumn,
        lastNameColumn,
        firstNameColumn,
        departmentColumn,
        programColumn,
        yearColumn,
        pereferenceColumn,
        adminInstructorPrefColumn,
        otherColumn
    ];
    const adminSelectedCols = [
        demoteColumn,
        lastNameColumn,
        firstNameColumn,
        departmentColumn,
        programColumn,
        yearColumn,
        pereferenceColumn,
        adminInstructorPrefColumn,
        otherColumn
    ];

    return isAdmin
        ? isSelectedTable
            ? adminSelectedCols
            : adminAvailableCols
        : instructorCols;
};

class ManageCourse extends React.Component {
    state = { filtered: [] };
    handleFilterChange = filtered => this.setState({ filtered });
    resetFilters = () => this.setState({ filtered: [] });
    render() {
        debugger;
        const { available, selected } = this.props.applicantsData;
        const noFilteredApplied = this.state.filtered.length === 0;
        return (
            <div>
                <Card>
                    <Card.Header>
                        {this.props.position
                            ? this.props.position.position_code
                            : "Course Name Unavailable"}
                    </Card.Header>
                    <Card.Body>
                        <h3>Selected</h3>
                        <ReactTable
                            // className="abc-table"
                            data={selected}
                            columns={getTableCols({ isSelectedTable: true })}
                            showPagination={false}
                            pageSize={selected.length}
                        />
                        <hr />
                        <h3>
                            Available
                            <Button
                                className="filter-reset-button"
                                disabled={noFilteredApplied}
                                size="sm"
                                variant={
                                    noFilteredApplied
                                        ? "outline-secondary"
                                        : "warning"
                                }
                                onClick={this.resetFilters}
                            >
                                {noFilteredApplied
                                    ? "No Filters Applied"
                                    : "Reset Filters"}
                            </Button>
                        </h3>
                        <ReactTable
                            // className="abc-table"
                            filtered={this.state.filtered}
                            onFilteredChange={this.handleFilterChange}
                            filterable={true}
                            defaultFilterMethod={(filter, row) =>
                                row[filter.id] &&
                                filter.value &&
                                row[filter.id]
                                    .toLowerCase()
                                    .indexOf(filter.value.toLowerCase()) !== -1
                            }
                            data={available}
                            columns={getTableCols({ isSelectedTable: false })}
                            showPagination={false}
                            // pageSize={available.length}
                        />
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

// export default connect(
//     (
//         {
//             ui: {
//                 applicants
//             }
//         },
//         { positionId, positionCode }
//     ) => ({
//         position: { positionId, positionCode },
//         applicants: applicants.positionData[positionId] || {
//             selected: [],
//             available: []
//         }
//     })
// )(ManageCourse);


export default connect((state, props) => {
    debugger;
    const position = findPositionByIdSelector(state, props.positionId)
    return {
    positionId: props.positionId,
    position,
    applicantsData: applicantsByPositionSelector(state, props.positionId)}
}
)(ManageCourse);
