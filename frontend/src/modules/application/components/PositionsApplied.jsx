import React from "react";
import { connect } from "react-redux";
import { fetchPositions } from "../actions";
import { Grid } from "react-bootstrap";
import DisplayInstructors from "./DisplayInstructors";
import ReactTable from "react-table";
import "react-table/react-table.css";

const COLUMNS = [
    { Header: "Code", accessor: "course_code" },
    { Header: "Course", accessor: "course_name" },
    {
        Header: "Preference",
        accessor: "prefence",
        height: 100,
        Cell: row => (
            <div>
                <select
                    id="dropdown-basic-button"
                    title="Dropdown button"
                    style={{ width: "60%" }}
                >
                    <option>Very Interested</option>
                    <option>Interested</option>
                    <option>Not Preferred</option>
                </select>
            </div>
        )
    },
    { Header: "Hours", accessor: "hours", width: 120 },
    {
        Header: "Instructors",
        accessor: "Instructors",
        id: "instructors",
        maxWidth: 200,
        Cell: DisplayInstructors
    }
];

class PositionsApplied extends React.Component {
    componentDidMount() {
        this.props.fetchPositions();
    }

    render() {
        return (
            <Grid fluid>
                <div style={{ paddingBottom: "50px" }}>
                    <ReactTable
                        showPagination={false}
                        pageSize={this.props.applicantsPositions.length}
                        columns={COLUMNS}
                        data={this.props.positions.data}
                        className={"positions-table"}
                        noDataText={"No positions found"}
                    />
                </div>
            </Grid>
        );
    }
}

export default connect(
    ({ application: { list } }) => ({
        positions: list
    }),
    { fetchPositions }
)(PositionsApplied);
