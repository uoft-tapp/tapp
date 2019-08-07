import React from "react";
//import { connect } from "react-redux"
import ReactTable from "react-table";
import "react-table/react-table.css";
import { ButtonGroup, Button, Container } from "react-bootstrap";
import "./offers.css";

const COLUMNS = [
    { Header: "First Name", accessor: "first_name", width: 100 },
    { Header: "Last Name", accessor: "last_name", width: 100 },
    { Header: "Email", accessor: "email", width: 250 },
    { Header: "Student Number", accessor: "student_number", width: 250 },
    { Header: "Position", accessor: "position_title", width: 130 },
    { Header: "Hours", accessor: "pay_period_desc", width: 80 },
    { Header: "Status", accessor: "status", width: 100 },
    { Header: "Contract Send Date", accessor: "emailed_date", width: 180 },
    { Header: "Nag Count", accessor: "nag_count", width: 100 },
    { Header: "First Time?", accessor: "first_time_ta", width: 100 } //First time TA'd?: Boolean
];

class Offers extends React.Component {
    render() {
        var date = new Date();
        const data = [
            {
                first_name: "Simon",
                last_name: "Aayani",
                email: "simon.aayani@mail.utoronto.ca",
                student_number: "1001111111",
                position_title: "CSC165H1Y",
                pay_period_desc: "60",
                emailed_date:
                    date.getDay() +
                    "/" +
                    date.getMonth() +
                    "/" +
                    date.getFullYear() +
                    ", " +
                    date.getHours() +
                    ":" +
                    date.getMinutes() +
                    ":" +
                    date.getSeconds(),
                first_time_ta: "True",
                status: "Pending",
                nag_count: undefined
            }
        ];
        return (
            <Container fluid>
                <ButtonGroup>
                    <Button id="import-btn">
                        <i className="fa fa-upload" id="buttontext" />
                        <br />
                        <small>Export</small>
                    </Button>
                    <Button id="export-btn">
                        <i className="fa fa-download" id="buttontext" />
                        <br />
                        <small>Import</small>
                    </Button>
                </ButtonGroup>
                <div className="ReactTableDiv">
                    <ReactTable
                        showPagination={false}
                        pageSize={1}
                        columns={COLUMNS}
                        data={data}
                        className={"positions-table"}
                        noDataText={"No Offers Found"}
                        SubComponent={() => {
                            return <div className="ReactTableDiv"> </div>;
                        }}
                    />
                </div>
            </Container>
        );
    }
}

export default Offers;
