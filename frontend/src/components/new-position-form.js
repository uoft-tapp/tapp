import React from "react";
import moment from "moment";

const errMsgs = {
    invalidDate: "Not a valid date",
    invalidInstructor: "Not an existing instructor",
    invalidNum: "Not a valid number"
};

const toNames = ({ first_name, last_name }) => `${first_name} ${last_name}`;

// Validators
const dummyValidator = () => true;
const existingInstructor = (val, props) => {
    for (const instructor of props.instructors) {
        if (val === toNames(instructor)) {
            return true;
        }
    }

    return false;
};
const validDate = val => val && moment(val, "YYYY-MM-DD", true).isValid();
const validNumber = val => val && !isNaN(val);

export const newPositionFields = [
    {
        errMsg: "",
        label: "Course Code",
        value: "course_code",
        validator: dummyValidator,
        required: true
    },
    {
        errMsg: "",
        label: "Course Name",
        value: "course_name",
        validator: dummyValidator,
        required: false
    },
    {
        errMsg: errMsgs.invalidNum,
        label: "Current Enrolment",
        value: "cap_enrolment",
        validator: validNumber,
        required: false
    },
    {
        errMsg: "",
        label: "Duties",
        value: "duties",
        validator: dummyValidator,
        required: false
    },
    {
        errMsg: "",
        label: "Qualifications",
        value: "qualifications",
        validator: dummyValidator,
        required: false
    },
    {
        errMsg: errMsgs.invalidInstructor,
        label: "Instructor",
        value: "instructor",
        validator: existingInstructor,
        required: true
    },
    {
        errMsg: errMsgs.invalidNum,
        label: "Session",
        value: "session_id",
        validator: validNumber,
        required: true
    },
    {
        errMsg: errMsgs.invalidNum,
        label: "Hours",
        value: "hours",
        validator: validNumber,
        required: false
    },
    {
        errMsg: errMsgs.invalidNum,
        label: "Openings",
        value: "openings",
        validator: validNumber,
        required: true
    },
    {
        errMsg: errMsgs.invalidDate,
        label: "Start Date",
        value: "start_date",
        validator: validDate,
        required: false
    },
    {
        errMsg: errMsgs.invalidDate,
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
    const curValueLowerCase = curValue.toLowerCase();
    let foundInstructor = false;
    let autocompleteInstructors = [];

    for (const instructor of instructors) {
        const instructor_name = toNames(instructor);

        if (curValue === instructor_name) {
            foundInstructor = true;
            break;
        } else if (
            instructor_name.toLowerCase().indexOf(curValueLowerCase) !== -1
        ) {
            autocompleteInstructors = [
                ...autocompleteInstructors,
                instructor_name
            ];
        }
    }

    return (
        <div>
            {!foundInstructor && (
                <ul>
                    {autocompleteInstructors.map(i => (
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
