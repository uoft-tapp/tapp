import React from "react"
import { Grid, Col } from "react-bootstrap"
import SelectCourse from "./SelectCourse"
import ManageCourse from "./ManageCourse"

class Applicants extends React.Component {
    render() {
        return (
            <Grid fluid>
                <Col xs={2}>
                    <SelectCourse />
                </Col>
                <Col xs={10}>
                    <ManageCourse />
                </Col>
            </Grid>
        )
    }
}

export default Applicants
