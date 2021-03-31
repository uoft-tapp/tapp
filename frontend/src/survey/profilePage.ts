export const profilePage = [
    {
        type: "text",
        name: "first_name",
        title: "First Name",
        //isRequired: true,
    },
    {
        type: "text",
        name: "last_name",
        title: "Last Name (Family Name)",
        //isRequired: true,
    },
    {
        type: "text",
        name: "email",
        title: "Email",
        inputType: "email",
        //isRequired: true,
    },
    {
        type: "text",
        name: "question2",
        title: "Cell Phone",
    },
    {
        type: "text",
        name: "student_number",
        title: "U of T Student Number",
    },
    {
        type: "text",
        name: "utorid",
        title: "UTORid",
        isRequired: true,
        readOnly: true,
        placeHolder: "XXX",
    },
];
