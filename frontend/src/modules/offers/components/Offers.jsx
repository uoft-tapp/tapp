import React from "react"
import { connect } from "react-redux"
import ReactTable from "react-table"
import "react-table/react-table.css"
import { Card, ButtonGroup, Button, Well, Container, Row, Col } from "react-bootstrap"

const COLUMNS = [
    { Header: "First Name", accessor: "first_name", width: 100 },
    { Header: "Last Name", accessor: "last_name", width: 100 },
    { Header: "Email", accessor: "email", width: 250 },
    { Header: "Position title", accessor: "position_title", width: 130 },
    { Header: "Start Date", accessor: "position_start_date", width: 90 },
    { Header: "End Date", accessor: "position_end_date", width: 90 },
    { Header: "First Time?", accessor: "first_time_ta", width: 100 }, //First time TA'd?: Boolean
    { Header: "Status", accessor: "status", width: 100 },
    { Header: "Offer Override PDF", accessor: "offer_override_pdf", width: 150 },
    { Header: "Nag Count", accessor: "nag_count", width: 100 }
]



class Offers extends React.Component {

    render() {
        const data = [{
            first_name : "Simon",
            last_name : "Aayani",
            email : "simon.aayani@mail.utoronto.ca",
            position_title : "Teaching Assistant",
            position_start_date : "Today",//new Date(),
            position_end_date : "Tomorrow",//new Date(),
            first_time_ta : "True",
            status : "Pending",
            nag_count : 1
          }]
        return (
            <Container fluid>

                <ButtonGroup>
                    <Button id="import-btn">
                        <i className="fa fa-upload" style={{ fontSize: "20px" }} />
                        <br />
                        <small>Export</small>
                    </Button>
                    <Button id="export-btn">
                        <i className="fa fa-download" style={{ fontSize: "20px" }} />
                        <br />
                        <small>Import</small>
                    </Button>
                </ButtonGroup>
                <div style={{ paddingBottom: "50px" }}>
                    <ReactTable
                        showPagination={false}
                        pageSize={1}
                        columns={COLUMNS}
                        data={data}
                        className={'positions-table'}
                        noDataText={'No Offers Found'}
                        SubComponent={({ original }) => {
                            return (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ flex: "1" }}>
                                        <label>Qualifications:</label> {original.qualifications}
                                    </div>
                                    <div style={{ flex: "1" }}>
                                        <label>Responsibilities:</label> {original.duties}
                                    </div>
                                </div>
                            )
                        }}
                    />
                </div>
            </Container>
        )
    }
}

export default Offers
