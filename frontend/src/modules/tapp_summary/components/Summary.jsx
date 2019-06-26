import React from "react";
import {
    ButtonGroup,
    Button,
    Container,
    Card,
    Row,
    Col
} from "react-bootstrap";

class Summary extends React.Component {
    render() {
        return (
            <Container>
                <Row>
                    <Col xs={12}>
                        <Card id="utils">
                            <Card.Header>Utilities</Card.Header>
                            <ButtonGroup>
                                <Button id="import-btn">
                                    <i
                                        className="fa fa-upload"
                                        style={{ fontSize: "20px" }}
                                    />
                                    <br />
                                    <small>Import</small>
                                </Button>
                                <Button id="export-btn">
                                    <i
                                        className="fa fa-download"
                                        style={{ fontSize: "20px" }}
                                    />
                                    <br />
                                    <small>Export</small>
                                </Button>
                                <Button>
                                    <i
                                        className="fa fa-share-square-o"
                                        style={{ fontSize: "20px" }}
                                    />
                                    <br />
                                    <small>Release</small>
                                </Button>
                            </ButtonGroup>
                        </Card>
                        <Card header="Assignment Statistics" id="stats">
                            <Container
                                id="gen-stats"
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                    alignItems: "center"
                                }}
                            >
                                <span className="stat">
                                    <h2>0</h2> applicants
                                </span>
                                <span className="divider">/</span>
                                <span className="stat">
                                    <h2>0</h2> graduate applicants
                                </span>
                                <span className="divider">/</span>
                                <span className="stat">
                                    <h2>0</h2> unassigned graduate applicants
                                </span>
                                <span className="divider">/</span>
                                <span className="stat">
                                    <h2>0</h2> DCS graduate applicants
                                </span>
                                <span className="divider">/</span>
                                <span className="stat">
                                    <h2>0</h2> unassigned DCS graduate
                                    applicants
                                </span>
                            </Container>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Summary;
