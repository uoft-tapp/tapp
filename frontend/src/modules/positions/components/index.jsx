import React from "react"
import { connect } from "react-redux"
import { fetchPositions, savePositions } from "../actions"
import { reduxForm } from "redux-form"
import { Grid, Panel, ListGroup, Alert, Button } from "react-bootstrap"
import PositionForm from "./PositionForm"
import PositionList from "./PositionList"

class Positions extends React.Component {
    componentDidMount() {
        this.props.fetchPositions()
    }
    render() {
        return (
            <Grid fluid id="courses-grid">
                <PositionList positions={this.props.positions} />
                <Panel id="course-form">
                    {this.props.dirty ? (
                        <Alert bsStyle="warning">
                            <strong>You have unsaved changes</strong>
                            <Button bsStyle="warning" bsSize="sm" onClick={this.props.handleSubmit}>
                                Save Changes
                            </Button>
                        </Alert>
                    ) : (
                        <Alert bsStyle="info">Up to date</Alert>
                    )}
                    <ListGroup>
                        {this.props.positions.map(position => (
                            <PositionForm key={position.id} position={position} />
                        ))}
                    </ListGroup>
                </Panel>
            </Grid>
        )
    }
}

export default connect(
    ({ positions }) => ({
        positions,
        initialValues: {
            positions: positions.reduce(
                (acc, cur) => ({
                    ...acc,
                    [cur.id]: {
                        estimated_enrol: cur.estimated_enrol,
                        cap_enrolment: cur.cap_enrolment,
                        num_waitlisted: cur.num_waitlisted,
                        openings: cur.openings,
                        hours: cur.hours,
                        qual: cur.qual,
                        resp: cur.resp,
                        round: {
                            start_date: cur.round.start_date.slice(0, 10),
                            end_date: cur.round.end_date.slice(0, 10)
                        }
                    }
                }),
                {}
            )
        }
    }),
    { fetchPositions, onSubmit: savePositions }
)(reduxForm({ form: "positions", enableReinitialize: true })(Positions))
