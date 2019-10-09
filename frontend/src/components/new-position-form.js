import React from "react";
import { moment } from "moment";

const toNames = ({ first_name, last_name }) => `${first_name} ${last_name}`;

const dummyValidator = () => "";
const validNumber = val => (val && isNaN(val) ? "Not a valid number" : "");
const validDate = val =>
    (val && moment(val, "YYYY-MM-DD", true).isValid()) || val === ""
        ? ""
        : "Not a valid date";
const validInstructor = (val, props) => {
    const instructors = props.instructors.map(toNames);
    return instructors.indexOf(val) !== -1 ? "" : "Not a valid instructor";
};

export const newPositionFields = [
    {
        label: "Course Code",
        value: "course_code",
        validator: dummyValidator,
        required: true
    },
    {
        label: "Course Name",
        value: "course_name",
        validator: dummyValidator,
        required: false
    },
    {
        label: "Current Enrolment",
        value: "cap_enrolment",
        validator: validNumber,
        required: false
    },
    {
        label: "Duties",
        value: "duties",
        validator: dummyValidator,
        required: false
    },
    {
        label: "Qualifications",
        value: "qualifications",
        validator: dummyValidator,
        required: false
    },
    {
        label: "Instructor",
        value: "instructor",
        validator: validInstructor,
        required: true
    },
    {
        label: "Session",
        value: "session_id",
        validator: validNumber,
        required: true
    },
    {
        label: "Hours",
        value: "hours",
        validator: validNumber,
        required: false
    },
    {
        label: "Openings",
        value: "openings",
        validator: validNumber,
        required: true
    },
    {
        label: "Start Date",
        value: "start_date",
        validator: validDate,
        required: false
    },
    {
        label: "End Date",
        value: "end_date",
        validator: validDate,
        required: false
    }
];

export const DefaultInput = ({ label, curValue, onChange, required }) => (
    <div>
        <label style={{ width: "100px" }}>
            {required ? label + "*" : label}
        </label>
        <input value={curValue} onChange={onChange} required={required} />
    </div>
);

export const TextboxInput = ({ label, curValue, onChange, required }) => (
    <div>
        <label style={{ width: "100px" }}>
            {required ? label + "*" : label}
        </label>
        <textarea
            style={{ width: "152px" }}
            value={curValue}
            onChange={onChange}
            required={required}
        />
    </div>
);

export const InstructorInput = ({ curValue, label, onChange, required }) => (
    <div>
        <label style={{ width: "100px" }}>
            {required ? label + "*" : label}
        </label>
        <input value={curValue} onChange={onChange} required={required} />
    </div>
);

export const InstructorList = ({ curValue, instructors, setInstructor }) => {
    const valid = validInstructor(curValue, { instructors });
    const matchingInstructors = instructors
        .map(({ first_name, last_name }) => `${first_name} ${last_name}`)
        .filter(
            name => name.toLowerCase().indexOf(curValue.toLowerCase()) !== -1
        );
    return (
        <div>
            {!!valid && (
                <ul>
                    {matchingInstructors.map(i => (
                        <li onClick={() => setInstructor(i)} key={i}>
                            {i}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export const initialState = {
    ...newPositionFields.reduce((acc, cur) => ({ ...acc, [cur.value]: "" }), {})
};
