import React from "react";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";
import { createNewApplication } from "../../api/actions/application_form"
import { updateField } from "./actions";
import {
    DefaultInput,
    TextboxInput,
    BinaryRadioInput,
    personalInformationFields,
    currentProgramInformationFields,
    currentStatusFields,
    customQuestions
} from "../../components/application-form";

class ApplicationForm extends React.Component {
    // dispatches a redux action to update the store
    handleChange = field_name => event => {
        this.props.updateField({ key: field_name, value: event.target.value });
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.createNewApplication(this.props.fields);
    };

    // Renders a simple field component
    render_field_type = ({ field_name, label, required, type }) => {
        switch (type) {
            case "textbox":
                return (
                    <TextboxInput
                        curValue={this.props.fields[field_name]}
                        key={label}
                        label={label}
                        field_name={field_name}
                        required={required}
                        onChange={this.handleChange(field_name)}
                    />
                );
            case "binary":
                if (
                    field_name !== "grad_student" &&
                    this.props.fields["grad_student"] !== "false"
                ) {
                    return;
                }
                return (
                    <BinaryRadioInput
                        curValue={this.props.fields[field_name]}
                        key={label}
                        label={label}
                        field_name={field_name}
                        required={required}
                        onChange={this.handleChange(field_name)}
                    />
                );
            default:
                return (
                    <DefaultInput
                        curValue={this.props.fields[field_name]}
                        key={label}
                        label={label}
                        field_name={field_name}
                        required={required}
                        onChange={this.handleChange(field_name)}
                    />
                );
        }
    };

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <h3>Personal Information</h3>
                    {personalInformationFields.map(
                        ({ field_name, label, required, type }) =>
                            this.render_field_type({
                                field_name,
                                label,
                                required,
                                type
                            })
                    )}

                    <h3>Current Program Information</h3>
                    {currentProgramInformationFields.map(
                        ({ field_name, label, required, type }) =>
                            this.render_field_type({
                                field_name,
                                label,
                                required,
                                type
                            })
                    )}

                    <h3>Current Status</h3>
                    {currentStatusFields.map(
                        ({ field_name, label, required, type }) =>
                            this.render_field_type({
                                field_name,
                                label,
                                required,
                                type
                            })
                    )}

                    <h3>Custom Questions</h3>
                    {customQuestions.map(
                        ({ field_name, label, required, type }) =>
                            this.render_field_type({
                                field_name,
                                label,
                                required,
                                type
                            })
                    )}
                    <Button variant="primary" type="submit">
                        {" "}
                        Submit{" "}
                    </Button>
                </form>
                <br />
                <br />
                <br />
            </div>
        );
    }
}

// connects the redux store to the props of this component
export default connect(
    ({
        ui: {
            application: { fields }
        }
    }) => ({
        fields: fields
    }),
    { updateField, createNewApplication }
)(ApplicationForm);
