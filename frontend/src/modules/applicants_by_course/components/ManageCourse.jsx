import React from "react"
import { connect } from "react-redux"
import { selectApplicant, removeApplicant } from "../actions"
import { Panel, Button } from "react-bootstrap"
import ReactTable from "react-table"

const SelectButton = connect(
    null,
    { selectApplicant }
)(({ selectApplicant, positionId, applicantId }) => (
    <Button
        bsSize="xs"
        style={{ width: "100%" }}
        onClick={() => selectApplicant({ positionId, applicantId })}
    >
        Select
    </Button>
))

const RemoveButton = connect(
    null,
    { removeApplicant }
)(({ removeApplicant, positionId, applicantId }) => (
    <Button
        bsSize="xs"
        style={{ width: "100%" }}
        onClick={() => removeApplicant({ positionId, applicantId })}
    >
        Remove
    </Button>
))

const promoteColumn = {
    Header: "Select",
    id: "promote",
    Cell: ({ original: { applicantId, positionId } }) => {
        return <SelectButton applicantId={applicantId} positionId={positionId} />
    },
    filterable: false,
    sortable: false,
    resizeable: false,
    width: 75
}

const demoteColumn = {
    Header: "Remove",
    id: "demote",
    Cell: ({ original: { applicantId, positionId, locked } }) => {
        if (locked) {
            return (
                <Button bsSize="xs" style={{ width: "100%" }} disabled>
                    <span className="fa fa-lock" /> Locked
                </Button>
            )
        }
        return <RemoveButton applicantId={applicantId} positionId={positionId} />
    },
    filterable: false,
    sortable: false,
    resizeable: false,
    width: 75
}

const cols = [
    { Header: "Last Name", accessor: "last_name" },
    { Header: "First Name", accessor: "first_name" },
    { Header: "Department", accessor: "department" },
    {
        Header: "Program",
        accessor: "program",
        filterMethod: (filter, row) => {
            if (filter.value === "not-undergrad") {
                return row[filter.id] !== "Undergrad"
            }
            return filter.value === "all" || filter.value === row[filter.id]
        },
        Filter: ({ filter, onChange }) => (
            <select
                onChange={event => onChange(event.target.value)}
                style={{ width: "100%" }}
                value={filter ? filter.value : "all"}
            >
                <option value="all">Show All</option>
                <option value="Undergrad">Undergrad</option>
                <option value="Graduate">Graduate</option>
                <option value="PostDoc">PostDoc</option>
                <option value="not-undergrad">Not Undergrad</option>
            </select>
        )
    },
    { Header: "Year", accessor: "year" },
    { Header: "Preference", accessor: "preference" },
    { Header: "Instructor Pref", accessor: "instructor_pref" },
    {
        Header: "Other Assignments",
        accessor: "other",
        Cell: ({ value }) => <span>{value.join(", ")}</span>,
        filterMethod: (filter, row) => {
            if (filter.value === "assigned") {
                return row[filter.id].length > 0
            } else if (filter.value === "unassigned") {
                return row[filter.id].length === 0
            }
            return true
        },
        Filter: ({ filter, onChange }) => (
            <select
                onChange={event => onChange(event.target.value)}
                style={{ width: "100%" }}
                value={filter ? filter.value : "all"}
            >
                <option value="all">Show All</option>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned Elsewhere</option>
            </select>
        )
    }
]

class ManageCourse extends React.Component {
    state = { filtered: [] }
    handleFilterChange = filtered => this.setState({ filtered })
    resetFilters = () => this.setState({ filtered: [] })
    render() {
        const { available, selected } = this.props.applicants
        const noFilteredApplied = this.state.filtered.length === 0
        return (
            <div>
                <Panel>
                    <Panel.Heading>
                        {this.props.position
                            ? this.props.position.course_code
                            : "Course Name Unavailable"}
                    </Panel.Heading>
                    <Panel.Body>
                        <h3 style={{ marginTop: 0 }}>Selected</h3>
                        <ReactTable
                            data={selected}
                            columns={[demoteColumn, ...cols]}
                            showPagination={false}
                            pageSize={selected.length}
                        />
                        <hr />
                        <h3 style={{ marginTop: 0 }}>
                            Available
                            <Button
                                disabled={noFilteredApplied}
                                style={{ marginLeft: "16px" }}
                                bsSize="sm"
                                bsStyle={noFilteredApplied ? "default" : "warning"}
                                onClick={this.resetFilters}
                            >
                                {noFilteredApplied ? "No Filters Applied" : "Reset Filters"}
                            </Button>
                        </h3>
                        <ReactTable
                            filtered={this.state.filtered}
                            onFilteredChange={this.handleFilterChange}
                            filterable={true}
                            defaultFilterMethod={(filter, row) =>
                                row[filter.id] &&
                                filter.value &&
                                row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !==
                                    -1
                            }
                            data={available}
                            columns={[promoteColumn, ...cols]}
                            showPagination={false}
                            pageSize={available.length}
                        />
                    </Panel.Body>
                </Panel>
            </div>
        )
    }
}

export default connect(({ applicants, positions: { list } }, { positionId }) => ({
    position: list.find(({ id }) => id === positionId),
    applicants: applicants.positionData[positionId] || { selected: [], available: [] }
}))(ManageCourse)
