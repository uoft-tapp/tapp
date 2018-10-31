import React from "react"
import { connect } from "react-redux"
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
                {this.props.openPositions.map(positionId => (
                    <Col xs={10} key={positionId}>
                        <ManageCourse positionId={positionId} />
                    </Col>
                ))}
            </Grid>
        )
    }
}

export default connect(({ applicants: { openPositions } }) => ({ openPositions }))(Applicants)
