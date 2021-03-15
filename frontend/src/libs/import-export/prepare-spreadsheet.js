/**
 * Return an array of [hours, duty, hours duty, ...] for the specified `ddah`
 *
 * @param {Ddah} ddah
 * @returns {((string | number)[])}
 */
function flattenDuties(ddah) {
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
function formatDateForSpreadsheet(date) {
    try {
        return date && new Date(date).toJSON().slice(0, 10);
    } catch (e) {
        return "";
    }
}

/**
 * Create header columns for a spreadsheet containing information about every pay period.
 *
 * @param {*} assignments
 * @returns
 */
function createPayPeriodHeaders(assignments) {
    const ret = [];
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
function formatWageChunksToList(wageChunks) {
    const ret = [];
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
    instructor: function (instructors) {
        return [["Last Name", "First Name", "UTORid", "email"]].concat(
            instructors.map((instructor) => [
                instructor.last_name,
                instructor.first_name,
                instructor.utorid,
                instructor.email,
            ])
        );
    },
    applicant: function (applicants) {
        return [
            [
                "Last Name",
                "First Name",
                "UTORid",
                "Student Number",
                "email",
                "Phone",
            ],
        ].concat(
            applicants.map((applicant) => [
                applicant.last_name,
                applicant.first_name,
                applicant.utorid,
                applicant.student_number,
                applicant.email,
                applicant.phone,
            ])
        );
    },
    position: function (positions) {
        return [
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
        ].concat(
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
        );
    },
    ddah: function prepareDdahsSpreadsheet(ddahs) {
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

        return [
            [
                "Position",
                "Last Name",
                "First Name",
                "email",
                "Assignment Hours",
                "Offer Status",
                "",
            ].concat(dutyHeaders),
        ].concat(
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
        );
    },
    assignment: function (assignments) {
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
            wage_chunks: assignment.wage_chunks.map((chunk) => ({
                hours: chunk.hours,
                rate: chunk.rate,
                start_date: chunk.start_date,
                end_date: chunk.end_date,
            })),
        }));
        return [
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
        ].concat(
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
                undefined,
                assignment.active_offer_recent_activity_date,
                ...formatWageChunksToList(assignment.wage_chunks),
            ])
        );
    },
};
