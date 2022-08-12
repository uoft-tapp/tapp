export const departmentCodes: Record<string, { abbrev: string; full: string }> =
    {
        math: {
            abbrev: "M",
            full: "Mathematics/Applied Mathematics",
        },
        cs: {
            abbrev: "CS",
            full: "Computer Science",
        },
        engr: {
            abbrev: "E",
            full: "Engineering",
        },
        astro: {
            abbrev: "A",
            full: "Astronomy and Astrophysics",
        },
        chem: {
            abbrev: "Ch",
            full: "Chemistry",
        },
        biophys: {
            abbrev: "B",
            full: "Medical Biophysics",
        },
        phys: {
            abbrev: "P",
            full: "Physics",
        },
        stat: {
            abbrev: "S",
            full: "Statistics",
        },
        other: {
            abbrev: "o",
            full: "Other",
        },
    };

export const programCodes: Record<string, { abbrev: string; full: string }> = {
    U: {
        abbrev: "U",
        full: "Undergraduate",
    },
    PD: {
        abbrev: "PD",
        full: "Postdoc",
    },
    P: {
        abbrev: "P",
        full: "PhD",
    },
    MScAC: {
        abbrev: "m",
        full: "Masters of Applied Computing",
    },
    M: {
        abbrev: "M",
        full: "Masters",
    },
    other: {
        abbrev: "o",
        full: "Other",
    },
};
