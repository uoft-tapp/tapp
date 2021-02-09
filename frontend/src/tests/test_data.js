import instructorsJSON from "./samples/instructors.json";
import applicantsJSON from "./samples/applicants.json";
import positionJSON from "./samples/positions.json";
import wrong1positionsJSON from "./samples/wrong1positions.json";
import wrong3positionsJSON from "./samples/wrong3positions.json";
import assignmentsJSON from "./samples/assignments.json";
import ddahsJSON from "./samples/ddahs.json";

// object JSON collections
export const objectJSON = {
    instructor: instructorsJSON,
    applicant: applicantsJSON,
    position: positionJSON,
    wrong1position: wrong1positionsJSON,
    wrong3position: wrong3positionsJSON,
    assignment: assignmentsJSON,
    ddah: ddahsJSON,
};

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

export const positionSchema = {
    keys: [
        "position_code",
        "position_title",
        "start_date",
        "end_date",
        "hours_per_assignment",
        "contract_template",
        "duties",
    ],
    keyMap: {
        "Position Code": "position_code",
        "Course Code": "position_code",
        "Course Name": "position_code",
        "Position Title": "position_title",
        "Start Date": "start_date",
        Start: "start_date",
        "End Date": "end_date",
        End: "end_date",
        "Hours Per Assignment": "hours_per_assignment",
        "Contract Template": "contract_template",
    },
    dateColumns: ["start_date", "end_date"],
    requiredKeys: ["position_code", "contract_template"],
    primaryKey: "position_code",
    baseName: "positions",
};

export const assignmentSchema = {
    keys: [
        "utorid",
        "position_code",
        "start_date",
        "end_date",
        "contract_template",
        "hours",
        "wage_chunks",
    ],
    keyMap: {
        "Position Code": "position_code",
        "Course Name": "position_code",
        "Start Date": "start_date",
        Start: "start_date",
        "End Date": "end_date",
        End: "end_date",
        Hours: "hours",
        "Number of Pay Periods": "wage_chunks",
    },
    dateColumns: ["start_date", "end_date"],
    requiredKeys: ["position_code", "utorid"],
    primaryKey: ["utorid", "position_code"],
    baseName: "assignments",
};

export const ddahSchema = {
    keys: ["position_code", "email", "hours", "first_name", "last_name"],
    keyMap: {
        "Position": "position_code",
        "Assignment Hours": "hours",
        "First Name": "first_name",
        "Given Name": "first_name",
        First: "first_name",
        "Last Name": "last_name",
        Surname: "last_name",
        "Family Name": "last_name",
        Last: "last_name",
    },
    dateColumns: [],
    requiredKeys: ["position_code"],
    primaryKey: ["position_code"],
    baseName: "ddahs",
};

export const instructorData = [
    {
        first_name: "Henry",
        last_name: "Smith",
        email: "hery.smith@utoronto.ca",
        utorid: "smithh",
    },
    {
        first_name: "Emily",
        last_name: "Garcia",
        email: "emily.garcia@utoronto.ca",
        utorid: "garciae",
    },
    {
        first_name: "Megan",
        last_name: "Miller",
        email: "megan.miller@utoronto.ca",
        utorid: "millerm",
    },
];

export const applicantData = [
    {
        first_name: "Celinda",
        last_name: "Najara",
        utorid: "cnajara0",
        email: "cnajara0@ycombinator.com",
        student_number: 5876,
        phone: "236-361-6762",
    },
    {
        first_name: "Sumner",
        last_name: "Silbersak",
        utorid: "ssilbersak1",
        email: "ssilbersak1@goo.gl",
        student_number: 7066,
        phone: "124-215-0134",
    },
    {
        first_name: "Creight",
        last_name: "Willingale",
        utorid: "cwillingale2",
        email: "cwillingale2@google.de",
        student_number: 263,
        phone: "835-889-7339",
    },
];

export const positionData = [
    {
        position_code: "MAT136H1F",
        position_title: "Calculus II",
        hours_per_assignment: 70,
        contract_template: "template1",
        start_date: new Date("2020-01-01").toISOString(),
        end_date: new Date("2020-05-01").toISOString(),
        duties: undefined,
    },
    {
        position_code: "CSC135H1F",
        position_title: "Computer Fun",
        hours_per_assignment: 75,
        duties: "Tutorials",
        contract_template: "template2",
        start_date: undefined,
        end_date: undefined,
    },
    {
        position_code: "MAT235H1F",
        position_title: "Calculus III",
        hours_per_assignment: 140,
        contract_template: "template2",
        start_date: undefined,
        end_date: undefined,
        duties: undefined,
    },
];

export const assignmentData = [
    {
        utorid: "PotterH",
        position_code: "MAGIC100",
        start_date: new Date("2020-01-01").toISOString(),
        end_date: new Date("2020-05-01").toISOString(),
        hours: 70,
        contract_template: "template1",
        wage_chunks: 10,
    },
    {
        utorid: "WeasleyR",
        position_code: "MAGIC200",
        start_date: undefined,
        end_date: undefined,
        hours: 80,
        contract_template: "template2",
        wage_chunks: 20,
    },
    {
        utorid: "GrangerH",
        position_code: "MAGIC999",
        start_date: undefined,
        end_date: undefined,
        hours: 800,
        contract_template: "template3",
        wage_chunks: 200,
    },
];

export const ddahData = [
    {
        position_code: "CSC494",
        last_name: "Potter",
        first_name: "A",
        email: "a@a.com",
        hours: 10,
    },
    {
        position_code: "CSC498",
        last_name: "Ron",
        first_name: "B",
        email: "b@b.com",
        hours: 20,
    },
];
