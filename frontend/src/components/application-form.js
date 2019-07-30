import React from "react";

export const DefaultInput = ({ label, curValue, onChange, required }) => (
    <div>
        <label style={{ width: "20vw" }}>
            {required ? label + ":" : label}
        </label>
        <input
            style={{ width: "30vw" }}
            value={curValue}
            onChange={onChange}
            required={required}
        />
    </div>
);

export const TextboxInput = ({ label, curValue, onChange, required }) => (
    <div>
        <label style={{ width: "20vh" }}>
            {required ? label + ":" : label}
        </label>
        <textarea
            style={{ width: "30vw" }}
            value={curValue}
            onChange={onChange}
            required={required}
        />
    </div>
);

export const BinaryRadioInput = ({ label, curValue, onChange, required }) => (
    <div>
        <label style={{ width: "20vw" }}>
            {required ? label + ":" : label}
        </label>
        <label>
            <input
                type="radio"
                value="true"
                checked={curValue === "true"}
                onChange={onChange}
            />
            Yes
        </label>
        <label>
            <input
                type="radio"
                value="false"
                checked={curValue === "false"}
                onChange={onChange}
            />
            No
        </label>
    </div>
);

export const personalInformationFields = [
    {
        label: "UTOR / JOIN id",
        type: "default",
        field_name: "utorid",
        validate: [],
        required: true
    },
    {
        label: "First Name",
        type: "default",
        field_name: "first_name",
        validate: [],
        required: true
    },
    {
        label: "Last Name",
        type: "default",
        field_name: "last_name",
        validate: [],
        required: true
    },
    {
        label: "Email",
        type: "default",
        field_name: "email",
        validate: [],
        required: true
    },
    {
        label: "Phone",
        type: "default",
        field_name: "phone",
        validate: [],
        required: true
    },
    {
        label: "Student Number",
        type: "default",
        field_name: "student_number",
        validate: [],
        required: true
    },
    {
        label: "Address",
        type: "textbox",
        field_name: "address",
        validate: [],
        required: true
    }
];

export const currentProgramInformationFields = [
    {
        label: "Enrolled Department",
        type: "default",
        field_name: "dept",
        validate: [],
        required: true
    },
    {
        label: "Program",
        type: "default",
        field_name: "program",
        validate: [],
        required: true
    },
    {
        label: "Year in Program",
        type: "default",
        field_name: "year_in_program",
        validate: [],
        required: true
    },
    {
        label: "Department Fields",
        type: "default",
        field_name: "dept_fields",
        validate: [],
        required: true
    }
];

export const currentStatusFields = [
    {
        label:
            "Will you be enrolled as a UofT graduate student for the TA session?",
        type: "binary",
        field_name: "is_grad_student",
        validate: [],
        required: true
    },
    {
        label: "Have you completed a UofT TA trainning?",
        field_name: "completed_training",
        type: "binary",
        validate: [],
        required: true
    },
    {
        label:
            "If you are an undergraduate student, please respond to the following statement:  I grant permission to the TA coordinator to access my academic history",
        type: "binary",
        field_name: "academic_history_permission",
        validate: [],
        required: true
    }
];

export const customQuestions = [
    {
        label:
            "List the programming languages and/or knowledge areas that you are competent in.",
        type: "textbox",
        field_name: "tech_knowledge",
        validate: [],
        required: true
    },
    {
        label:
            "Indicante any times that you will be unavailable for TA duties.",
        type: "textbox",
        field_name: "available_time",
        validate: [],
        required: true
    }
];

const allFields = [].concat(
    personalInformationFields,
    currentProgramInformationFields,
    currentStatusFields,
    customQuestions
);

export const initialFields = allFields.reduce(
    (acc, cur) => ({ ...acc, [cur.field_name]: "" }),
    {}
);