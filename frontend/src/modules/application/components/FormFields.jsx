/*
This file contains all of the fields for the application form.  
Each field is defined as an object with the following attributes:
    label: the text that appears on the form beside the input
    type: a string that determines whether the input is a default input field, a textbox, or a binary radio choice
    field_name: the key name for the field
    validate: possible validations, not yet implemented
    required: whether or not the field is required to be filled
*/
export const personalInformationFields = [
    { label: "UTOR / JOIN id", type: "default", field_name: "utor_id", validate: [], required: true },
    { label: "First Name", type: "default", field_name: "first_name", validate: [], required: true },
    { label: "Last Name", type: "default", field_name: "last_name", validate: [], required: true },
    { label: "Email", type: "default", field_name: "email", validate: [], required: true },
    { label: "Phone", type: "default", field_name: "phone_num", validate: [], required: true },
    { label: "Student ID", type: "default", field_name: "student_id", validate: [], required: true },
    { label: "Address", type: "textbox", field_name: "address", validate: [], required: true }
]

export const currentProgramInformationFields = [
    { label: "Enrolled Department", type: "default", field_name: "enroll_dept", validate: [], required: true },
    { label: "Program", type: "default", field_name: "program", validate: [], required: true },
    { label: "Year in Program", type: "default", field_name: "program_year", validate: [], required: true },
    { label: "Department Fields", type: "default", field_name: "dept_fields", validate: [], required: true }
]

export const currentStatusFields = [
    { label: "Will you be enrolled as a UofT graduate student for the TA session?", type: "binary", field_name: "grad_student", validate: [], required: true },
    { label: "Have you completed a UofT TA trainning?", field_name: "completed_training", type: "binary", validate: [], required: true },
    { label: "If you are an undergraduate student, please respond to the following statement:  I grant permission to the TA coordinator to access my academic history", type: "binary", field_name: "academic_history_permission", validate: [], required: true },
]

export const customQuestions = [
    { label: "List the programming languages and/or knowledge areas that you are competent in.", type: "textbox", field_name: "tech_knowledge", validate: [], required: true },
    { label: "Indicante any times that you will be unavailable for TA duties.", type: "textbox", field_name: "available_time", validate: [], required: true }
]

const allFields = [].concat(
    personalInformationFields, 
    currentProgramInformationFields,
    currentStatusFields, 
    customQuestions)

export const initialFields = allFields.reduce((acc, cur) => ({ ...acc, [cur.field_name]: "" }), {})
