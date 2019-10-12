import React from "react";
import { connect } from "react-redux";
import { upsertPosition } from "../../api/actions/positions";
import {
    DefaultInput,
    InstructorInput,
    InstructorList,
    TextboxInput,
    initialState,
    newPositionFields
} from "../../components/new-position-form";
import { RedirectableComponent } from "../../components/redirectable-component";
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

    handleSubmit = async e => {
        e.preventDefault();
        const result = await this.props.upsertPosition(this.state);

        if (result.status === "success") {
            this.props.enableRedirect();
        }
    };
    getInvalid = () =>
        newPositionFields.reduce((acc, cur) => {
            if (
                (!cur.required && this.state[cur.value] === "") ||
                cur.validator(this.state[cur.value], this.props)
            ) {
                return acc;
            } else {
                return `${cur.label}: ${cur.errMsg}`;
            }
        }, []);
    setInstructor = name => this.setState({ instructor: name });

    handleForce = async data => {
        for (var i = 1; i < data.length; i++) {
            const position = {
                id: data[i][0],
                position_code: data[i][1],
                position_title: data[i][2],
                est_hours_per_assignment: data[i][3],
                est_start_date: data[i][4],
                est_end_date: data[i][5],
                position_type: data[i][6],
                duties: data[i][7],
                qualifications: data[i][8],
                ad_hours_per_assignment: data[i][9],
                ad_num_assignments: data[i][10],
                ad_open_date: data[i][11],
                ad_close_date: data[i][12],
                desired_num_assignments: data[i][13],
                current_enrollment: data[i][14],
                current_waitlisted: data[i][15]
            };
            await this.props.upsertPosition(position);
        }
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

function RedirectableNewPosition(props) {
    return (
        <RedirectableComponent
            route="/tapp/positions"
            component={NewPosition}
            {...props}
        />
    );
}

export default connect(
    ({
        ui: {
            instructors: { list }
        }
    }) => ({
        instructors: list
    }),
    { fetchInstructors, upsertPosition }
)(RedirectableNewPosition);
