import React from "react";
import { connect } from "react-redux";
import { Col, Container, Row } from "react-bootstrap";
import SelectCourse from "./SelectCourse";
import ManageCourse from "./ManageCourse";

class Applicants extends React.Component {
    render() {
        return (
            <Container fluid>
                <Row>
                    <Col xs={2}>
                        <SelectCourse />
                    </Col>
                    {this.props.openPositions.map(positionId => (
                        <Col
                            xs={10 / this.props.openPositions.length}
                            key={positionId}
                        >
                            <ManageCourse positionId={positionId} />
                        </Col>
                    ))}
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = ({
    ui: {
        applicants: { openPositions }
    }
}) => ({ openPositions });

export default connect(mapStateToProps)(Applicants);
