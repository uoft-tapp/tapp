export const statusPage = [
    {
        type: "dropdown",
        name: "status",
        title:
            "At the start of the next academic term, your status at the University of Toronto will be...",
        // isRequired: true,
        choices: [
            {
                value: "P",
                text: "PhD Student",
            },
            {
                value: "M",
                text: "Masters Student",
            },
            {
                value: "U",
                text: "Undergraduate Student",
            },
        ],
        hasOther: true,
    },
    {
        type: "text",
        name: "program_start",
        title: "When did you start your program?",
        // isRequired: true,
        inputType: "date",
    },
    {
        type: "dropdown",
        name: "department",
        title: "What is your program of study?",
        // isRequired: true,
        choices: [
            {
                value: "math",
                text: "Mathematics/Applied Mathematics",
            },
            {
                value: "cs",
                text: "Computer Science",
            },
            {
                value: "engr",
                text: "Engineering",
            },
            {
                value: "phys",
                text: "Physics",
            },
            {
                value: "stat",
                text: "Statistics",
            },
        ],
        hasOther: true,
    },
    {
        type: "file",
        name: "transcripts",
        visibleIf: "{status} = 'U'",
        title: "Please upload your unofficial transcript(s).",
        // isRequired: true,
        allowMultiple: true,
        maxSize: 0,
    },
];
