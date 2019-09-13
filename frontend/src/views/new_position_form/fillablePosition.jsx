import React from "react";
import { connect } from "react-redux";
import {
    createNewPosition,
    importNewPosition } from "../../api/actions/new_position";
import { importResult } from "./actions";
import {
    DefaultInput,
    InstructorInput,
    InstructorList,
    TextboxInput,
    initialState,
    newPositionFields
} from "../../components/new-position-form";
import { fetchInstructors } from "../../modules/instructors/actions";
import { Col, Container, Button } from "react-bootstrap";
import CSVReader from "react-csv-reader";

class NewPosition extends React.Component {
    componentDidMount() {
        this.props.fetchInstructors();
    }
    state = { ...initialState };
    handleChange = prop => event =>
        this.setState({ [prop]: event.target.value });

    handleSubmit = e => {
        e.preventDefault();
        this.props.createNewPosition(this.state);
    };
    getInvalid = () =>
        newPositionFields.reduce((acc, cur) => {
            if (acc) {
                return acc;
            }
            const errorMessage = cur.validate.reduce(
                (running, validator) =>
                    running || validator(this.state[cur.value], this.props),
                false
            );
            return errorMessage ? `${cur.label}: ${errorMessage}` : acc;
        }, false);
    setInstructor = name => this.setState({ instructor: name });

    handleForce = async data => {
        let num_failures_before_import = this.props.newPosition.num_failures;
        let num_successes_before_import = this.props.newPosition.num_successes;

        for (var i = 1; i < data.length; i++) {
            const position = {
                course_code: data[i][0],
                course_name: data[i][1],
                cap_enrolment: data[i][2],
                duties: data[i][3],
                qualifications: data[i][4],
                instructor: data[i][5],
                session_id: data[i][6],
                hours: data[i][7],
                openings: data[i][8],
                start_date: data[i][9],
                end_date: data[i][10]
            };
            await this.props.importNewPosition(position);
        }

        console.log(this.props.newPosition);
        let num_failures_after_import = this.props.newPosition.num_failures;
        let num_successes_after_import = this.props.newPosition.num_successes;
        let failed_imports = num_failures_after_import - num_failures_before_import;
        let success_imports = num_successes_after_import - num_successes_before_import;
        this.props.importResult(success_imports, failed_imports);
    };

    render() {
        const invalid = this.getInvalid();
        return (
            <Container>
                <Col xs={8} md={{ offset: 1 }}>
                    <h2>New Position</h2>
                    <form onSubmit={this.handleSubmit}>
                        {newPositionFields.map(({ value, label, required }) => {
                            switch (value) {
                                case "instructor":
                                    return (
                                        <div>
                                            <InstructorInput
                                                curValue={this.state[value]}
                                                required={required}
                                                key={label}
                                                label={label}
                                                value={value}
                                                onChange={this.handleChange(
                                                    value
                                                )}
                                            />
                                            {this.state.instructor !== "" && (
                                                <InstructorList
                                                    curValue={this.state[value]}
                                                    setInstructor={
                                                        this.setInstructor
                                                    }
                                                    key="instructorList"
                                                    instructors={
                                                        this.props.instructors
                                                    }
                                                />
                                            )}
                                        </div>
                                    );

                                case "qualifications":
                                case "duties":
                                    return (
                                        <TextboxInput
                                            curValue={this.state[value]}
                                            key={label}
                                            label={label}
                                            value={value}
                                            required={required}
                                            onChange={this.handleChange(value)}
                                        />
                                    );
                                default:
                                    return (
                                        <DefaultInput
                                            curValue={this.state[value]}
                                            key={label}
                                            label={label}
                                            value={value}
                                            required={required}
                                            onChange={this.handleChange(value)}
                                        />
                                    );
                            }
                        })}
                        <br />
                        <CSVReader
                            cssClass="csv-reader-input"
                            label="Select CSV file for new position"
                            onFileLoaded={this.handleForce}
                            inputStyle={{ color: "red" }}
                        />
                        <br />
                        <Button
                            variant="primary"
                            disabled={!!invalid}
                            type="submit"
                        >
                            {invalid || "Save Changes"}
                        </Button>
                    </form>
                </Col>
            </Container>
        );
    }
}

export default connect(
    ({
        ui: {
            instructors: { list },
            newPosition: { num_failures, num_successes }
        }
    }) => ({
        instructors: list,
        newPosition: { num_failures, num_successes }
    }),
    { createNewPosition, fetchInstructors, importNewPosition, importResult }
)(NewPosition);