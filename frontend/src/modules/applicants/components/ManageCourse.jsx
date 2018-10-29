import React from "react"
import { Panel, Button } from "react-bootstrap"
import ReactTable from "react-table"

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
const data1 = [
    {
        last_name: "Paul",
        first_name: "Steve",
        department: "dept",
        program: "prog",
        year: "3",
        other: []
    }
]
const data2 = [
    {
        last_name: "Paul",
        first_name: "Steve",
        department: "dept",
        program: "Undergrad",
        year: "3",
        other: []
    },
    {
        last_name: "Smith",
        first_name: "Harold",
        department: "dept",
        program: "Graduate",
        year: "3",
        other: []
    },
    {
        last_name: "Jones",
        first_name: "Harvey",
        department: "dept",
        program: "PostDoc",
        year: "3",
        other: []
    },
    {
        last_name: "McDonald",
        first_name: "Adam",
        department: "dept",
        program: "Graduate",
        year: "3",
        other: ["CSC108"]
    },
    {
        last_name: "Mulligan",
        first_name: "Anthony",
        department: "dept",
        program: "PostDoc",
        year: "3",
        other: []
    }
]

class ManageCourse extends React.Component {
    state = { filtered: [] }
    handleFilterChange = filtered => this.setState({ filtered })
    resetFilters = () => this.setState({ filtered: [] })
    render() {
        return (
            <div>
                <Panel>
                    <Panel.Heading>Course Name</Panel.Heading>
                    <Panel.Body>
                        <h3 style={{ marginTop: 0 }}>Selected</h3>
                        <ReactTable
                            data={data1}
                            columns={cols}
                            showPagination={false}
                            pageSize={data1.length}
                        />
                        <hr />
                        <h3 style={{ marginTop: 0 }}>Available</h3>
                        <Button bsStyle="warning" onClick={this.resetFilters}>
                            Reset Filters
                        </Button>
                        <ReactTable
                            filtered={this.state.filtered}
                            onFilteredChange={this.handleFilterChange}
                            filterable={true}
                            defaultFilterMethod={(filter, row) =>
                                row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !==
                                -1
                            }
                            data={data2}
                            columns={cols}
                            showPagination={false}
                            pageSize={data2.length}
                        />
                    </Panel.Body>
                </Panel>
            </div>
        )
    }
}

export default ManageCourse
