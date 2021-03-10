export const instructorSchema = {
    keys: ["first_name", "last_name", "utorid", "email"],
    keyMap: {
        "First Name": "first_name",
        "Given Name": "first_name",
        First: "first_name",
        "Last Name": "last_name",
        Surname: "last_name",
        "Family Name": "last_name",
        Last: "last_name",
    },
    requiredKeys: ["utorid"],
    primaryKey: "utorid",
    dateColumns: [],
    baseName: "instructors",
};

export const applicantSchema = {
    keys: [
        "first_name",
        "last_name",
        "utorid",
        "email",
        "student_number",
        "phone",
    ],
    keyMap: {
        "First Name": "first_name",
        "Given Name": "first_name",
        First: "first_name",
        "Last Name": "last_name",
        Surname: "last_name",
        "Family Name": "last_name",
        Last: "last_name",
        "Student Number": "student_number",
    },
    requiredKeys: ["utorid"],
    primaryKey: "utorid",
    dateColumns: [],
    baseName: "applicants",
};
