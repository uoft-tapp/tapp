import {
    Applicant,
    Application,
    Assignment,
    Ddah,
    Instructor,
    Position,
    Posting,
    WageChunk,
} from "../../api/defs/types";
import { spreadsheetUndefinedToNull } from "../import-export/undefinedToNull";
import { prepareMinimal } from "./prepare-minimal";

/**
 * Type of a spreadsheet cell
 */
type CellType = number | string | null | undefined;

/**
 * Return an array of [hours, duty, hours duty, ...] for the specified `ddah`
 *
 * @param ddah
 * @returns
 */
function flattenDuties(ddah: Ddah) {
    const ret = [];
    const duties = [...ddah.duties];
    duties.sort((a, b) => a.order - b.order);

    for (const duty of duties) {
        ret.push(duty.hours);
        ret.push(duty.description);
    }

    return ret;
}

/**
 * Format a date as YYYY-MM-DD for inserting into a spreadsheet
 *
 * @param {*} date
 * @returns
 */
function formatDateForSpreadsheet(date: string | number | null | undefined) {
    try {
        return date && new Date(date).toJSON().slice(0, 10);
    } catch (e) {
        return "";
    }
}

type BasicWageChunk = ({ hours: number } & Record<string, any>)[];
interface HasWageChunk extends Record<string, any> {
    wage_chunks: BasicWageChunk | undefined;
}

/**
 * Create header columns for a spreadsheet containing information about every pay period.
 *
 * @param {*} assignments
 * @returns
 */
function createPayPeriodHeaders(assignments: HasWageChunk[]) {
    const ret: string[] = [];
    if (!assignments) {
        return ret;
    }
    const maxNumPeriods = Math.max(
        ...assignments.map((assignment) => assignment.wage_chunks?.length || 0),
        0
    );

    for (let i = 0; i < maxNumPeriods; i++) {
        ret.push(
            `Period ${i + 1} Rate`,
            `Period ${i + 1} Hours`,
            `Period ${i + 1} Start Date`,
            `Period ${i + 1} End Date`
        );
    }
    return ret;
}

/**
 * Create formatted rows providing information about each wage chunk.
 *
 * @param {*} wageChunks
 * @returns
 */
function formatWageChunksToList(
    wageChunks: Omit<WageChunk, "id">[] | null | undefined
) {
    const ret: (string | number | undefined | null)[] = [];
    if (!wageChunks) {
        return ret;
    }

    ret.push(wageChunks.length);
    for (const chunk of wageChunks) {
        ret.push(
            chunk.rate,
            chunk.hours,
            formatDateForSpreadsheet(chunk.start_date),
            formatDateForSpreadsheet(chunk.end_date)
        );
    }
    return ret;
}

/**
 * Functions which turns an array of objects into an Array of Arrays suitable
 * for converting into a spreadsheet.
 */
export const prepareSpreadsheet = {
    instructor: function (instructors: Instructor[]) {
        return spreadsheetUndefinedToNull(
            ([
                ["Last Name", "First Name", "UTORid", "email"],
            ] as CellType[][]).concat(
                instructors.map((instructor) => [
                    instructor.last_name,
                    instructor.first_name,
                    instructor.utorid,
                    instructor.email,
                ])
            )
        );
    },
    applicant: function (applicants: Applicant[]) {
        return spreadsheetUndefinedToNull(
            ([
                [
                    "Last Name",
                    "First Name",
                    "UTORid",
                    "Student Number",
                    "email",
                    "Phone",
                ],
            ] as CellType[][]).concat(
                applicants.map((applicant) => [
                    applicant.last_name,
                    applicant.first_name,
                    applicant.utorid,
                    applicant.student_number,
                    applicant.email,
                    applicant.phone,
                ])
            )
        );
    },
    application: function (applications: Application[]) {
        const minApps = applications.map(prepareMinimal.application);
        const baseUrl = document.location.origin;
        return spreadsheetUndefinedToNull(
            ([
                [
                    "Last Name",
                    "First Name",
                    "UTORid",
                    "Student Number",
                    "email",
                    "Phone",
                    "Annotation",
                    "Department",
                    "Program",
                    "YIP",
                    "GPA",
                    "Posting",
                    "Position Preferences",
                    "Previous Experience Summary",
                    "Comments",
                    "Documents",
                    "Custom Question Answers",
                    "Submission Date",
                ],
            ] as CellType[][]).concat(
                minApps.map((application) => [
                    application.last_name,
                    application.first_name,
                    application.utorid,
                    application.student_number,
                    application.email,
                    application.phone,
                    application.annotation,
                    application.department,
                    application.program,
                    application.yip,
                    application.gpa,
                    application.posting,
                    application.position_preferences
                        .map(
                            (position_preference) =>
                                `${position_preference.preference_level}:${position_preference.position_code}`
                        )
                        .join("; "),
                    application.previous_experience_summary,
                    application.comments,
                    application.documents
                        .map(
                            (document) =>
                                new URL(
                                    `${baseUrl}/public/files/${document.url_token}`
                                ).href
                        )
                        .join(" "),
                    application.custom_question_answers
                        ? JSON.stringify(application.custom_question_answers)
                        : null,
                    application.submission_date,
                ])
            )
        );
    },
    position: function (positions: Position[]) {
        return spreadsheetUndefinedToNull(
            ([
                [
                    "Position Code",
                    "Position Title",
                    "Start Date",
                    "End Date",
                    "Hours Per Assignment",
                    "Number of Assignments",
                    "Contract Template",
                    "Instructors",
                    "Duties",
                    "Qualifications",
                    "Current Enrollment",
                    "Current Waitlist",
                ],
            ] as CellType[][]).concat(
                positions.map((position) => [
                    position.position_code,
                    position.position_title,
                    position.start_date &&
                        new Date(position.start_date).toJSON().slice(0, 10),
                    position.end_date &&
                        new Date(position.end_date).toJSON().slice(0, 10),
                    position.hours_per_assignment,
                    position.desired_num_assignments,
                    position.contract_template.template_name,
                    position.instructors
                        .map(
                            (instructor) =>
                                `${instructor.last_name}, ${instructor.first_name}`
                        )
                        .join("; "),
                    position.duties || "",
                    position.qualifications || "",
                    position.current_enrollment,
                    position.current_waitlisted,
                ])
            )
        );
    },
    posting: function (posting: Posting) {
        // Most of the information about the posting is exported in the first row of the spreadsheet.
        // However, the PostingPositions take many rows. In the additional rows we fill cells with
        // `null` so that they show up empty in the spreadsheet.
        const firstItems = [
            posting.name,
            posting.open_date,
            posting.close_date,
        ];
        const lastItems = [
            posting.intro_text,
            JSON.stringify(posting.custom_questions),
        ];
        const emptyFirstItems = [null, null, null];
        const emptyLastItems = [null, null];
        return spreadsheetUndefinedToNull(
            ([
                [
                    "Name",
                    "Open Date",
                    "Close Date",
                    "Position Code",
                    "Num Positions",
                    "Hours per Assignment",
                    "Intro Text",
                    "Custom Questions",
                ],
            ] as CellType[][]).concat(
                Array.from(
                    { length: Math.max(posting.posting_positions.length, 1) },
                    (_, i) => {
                        const first = i === 0 ? firstItems : emptyFirstItems;
                        const last = i === 0 ? lastItems : emptyLastItems;
                        const postingPosition = posting.posting_positions[i];

                        return [
                            ...first,
                            postingPosition?.position?.position_code,
                            postingPosition?.num_positions,
                            postingPosition?.hours,
                            ...last,
                        ];
                    }
                )
            )
        );
    },
    ddah: function prepareDdahsSpreadsheet(ddahs: Ddah[]) {
        // Compute the maximum number of duties, because each duty gets a column.
        const maxDuties = Math.max(
            ...ddahs.map((ddah) => ddah.duties.length || 0),
            0
        );
        // Create headers for the duty columns
        const dutyHeaders = Array.from({ length: maxDuties * 2 }, (_, i) => {
            if (i % 2 === 0) {
                return `Hours ${i / 2 + 1}`;
            }
            return `Duty ${(i - 1) / 2 + 1}`;
        });

        return spreadsheetUndefinedToNull(
            ([
                [
                    "Position",
                    "Last Name",
                    "First Name",
                    "email",
                    "Assignment Hours",
                    "Offer Status",
                    "",
                ].concat(dutyHeaders),
            ] as CellType[][]).concat(
                ddahs.map((ddah) =>
                    [
                        ddah.assignment.position.position_code,
                        ddah.assignment.applicant.last_name,
                        ddah.assignment.applicant.first_name,
                        ddah.assignment.applicant.email,
                        ddah.assignment.hours,
                        ddah.assignment.active_offer_status,
                        "",
                    ].concat(flattenDuties(ddah))
                )
            )
        );
    },
    assignment: function (assignments: Assignment[]) {
        // We want to flatten a lot of the data in `assignments` and only include the information
        // we need.
        const assignmentsForSpreadsheet = assignments.map((assignment) => ({
            first_name: assignment.applicant.first_name,
            last_name: assignment.applicant.last_name,
            utorid: assignment.applicant.utorid,
            email: assignment.applicant.email,
            position_code: assignment.position.position_code,
            start_date: assignment.start_date,
            end_date: assignment.end_date,
            contract_template: assignment.contract_override_pdf
                ? null
                : assignment.position.contract_template.template_name,
            contract_override_pdf: assignment.contract_override_pdf,
            hours: assignment.hours,
            active_offer_status: assignment.active_offer_status,
            active_offer_recent_activity_date:
                assignment.active_offer_recent_activity_date,
            wage_chunks: assignment.wage_chunks?.map((chunk) => ({
                hours: chunk.hours,
                rate: chunk.rate,
                start_date: chunk.start_date,
                end_date: chunk.end_date,
            })),
        }));
        return spreadsheetUndefinedToNull(
            ([
                [
                    "Last Name",
                    "First Name",
                    "UTORid",
                    "Email",
                    "Position Code",
                    "Start Date",
                    "End Date",
                    "Hours",
                    "Contract Template",
                    "Contract Override PDF",
                    "Offer Status",
                    "Recent Activity Date",
                    "",
                    "Number of Pay Periods",
                    ...createPayPeriodHeaders(assignmentsForSpreadsheet),
                ],
            ] as CellType[][]).concat(
                assignmentsForSpreadsheet.map((assignment) => [
                    assignment.last_name,
                    assignment.first_name,
                    assignment.utorid,
                    assignment.email,
                    assignment.position_code,
                    formatDateForSpreadsheet(assignment.start_date),
                    formatDateForSpreadsheet(assignment.end_date),
                    assignment.hours,
                    assignment.contract_template,
                    assignment.contract_override_pdf,
                    assignment.active_offer_status,
                    null,
                    assignment.active_offer_recent_activity_date,
                    ...formatWageChunksToList(assignment.wage_chunks),
                ])
            )
        );
    },
};
