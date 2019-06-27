import React from "react";
import { connect } from "react-redux";
import { fetchPositions } from "../actions";
import { Container } from "react-bootstrap";
import ReactTable from "react-table";
import "react-table/react-table.css";
import EditPositionModal from "./EditPositionModal";
import RowActions from "./RowActions";
import DisplayInstructors from "./DisplayInstructors";

const COLUMNS = [
    { Header: "Code", accessor: "course_code", width: 100 },
    { Header: "Course", accessor: "course_name" },
    { Header: "Est/Cur Enrol", accessor: "current_enrolment", width: 100 },
    { Header: "Enrol Cap", accessor: "cap_enrolment", width: 80 },
    { Header: "Waitlisted", accessor: "num_waitlisted", width: 80 },
    { Header: "Positions", accessor: "openings", width: 80 },
    { Header: "Hours", accessor: "hours", width: 60 },
    { Header: "Start Date", accessor: "start_date", width: 100 },
    { Header: "End Date", accessor: "end_date", width: 100 },
    {
        Header: "Instructors",
        id: "instructors",
        maxWidth: 200,
        Cell: DisplayInstructors
    },
    {
        Header: "Actions",
        id: "actions",
        width: 100,
        Cell: props => <RowActions {...props} />
    }
];

class Positions extends React.Component {
    componentDidMount() {
        this.props.fetchPositions();
    }
    render() {
        const { positions = [] } = this.props;
        return (
            <Container fluid>
                <div style={{ paddingBottom: "50px" }}>
                    <ReactTable
                        showPagination={false}
                        pageSize={positions.length}
                        columns={COLUMNS}
                        data={positions}
                        className={"positions-table"}
                        noDataText={"No positions found"}
                        SubComponent={({ original }) => {
                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div style={{ flex: "1" }}>
                                        <label>Qualifications:</label>{" "}
                                        {original.qualifications}
                                    </div>
                                    <div style={{ flex: "1" }}>
                                        <label>Responsibilities:</label>{" "}
                                        {original.duties}
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>
                <EditPositionModal />
            </Container>
        );
    }
}

export default connect(
    ({ positions: { list } }) => ({
        positions: list
    }),
    { fetchPositions }
)(Positions);
