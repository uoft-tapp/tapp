/*
 * A collection of utility functions for use when exporting data.
 */

import {
    WageChunk,
    Session,
    Position,
    Instructor,
    Assignment,
    ContractTemplate,
    Applicant,
    MinimalWageChunk,
    MinimalSession,
    MinimalPosition,
    MinimalInstructor,
    MinimalAssignment,
    MinimalContractTemplate,
    MinimalApplicant,
    MinimalDdah,
    Ddah,
    MinimalApplication,
    Application,
} from "../../api/defs/types";

/**
 * Determine whether `wageChunks` can be derived from `session`. E.g.,
 * the rates match the session rates.
 *
 * @param {*} wageChunks
 * @param {*} position
 * @param {*} session
 * @param {Number} assignmentHours
 * @returns {boolean}
 */
function wageChunksMatchPositionAndSession(
    wageChunks: WageChunk[],
    position: Position,
    session: Session,
    assignmentHours: Number
): boolean {
    if (!session || !Array.isArray(wageChunks)) {
        return true;
    }
    // A single wage chunk matching the session rate is derivable
    if (wageChunks.length === 1) {
        const chunk: WageChunk = wageChunks[0];
        if (
            chunk.start_date === position.start_date &&
            chunk.end_date === position.end_date &&
            (chunk.rate === session.rate1 || chunk.rate === session.rate2) &&
            chunk.hours === assignmentHours
        ) {
            return true;
        }
    }
    // Two wage chunks split at January matching the session rates are derivable
    if (wageChunks.length === 2) {
        let [chunk1, chunk2] = wageChunks;
        // If for some reason the wage chunks don't have dates, they aren't derivable.
        if (
            !chunk1.end_date ||
            !chunk1.end_date ||
            !chunk2.start_date ||
            !chunk2.end_date
        ) {
            return false;
        }
        // Make sure the wage chunks are ordered by date
        if (chunk1.end_date > chunk2.start_date) {
            const tmp = chunk1;
            chunk1 = chunk2;
            chunk2 = tmp;
        }

        // If the wage chunk dates don't match the position's dates,
        // we're not derivable.
        if (
            chunk1.start_date !== position.start_date ||
            chunk2.end_date !== position.end_date
        ) {
            return false;
        }

        // If the sum of hours of wage chunks doesn't match the hours of assignment
        // we're not derivable.
        if (chunk1.hours + chunk2.hours !== assignmentHours) {
            return false;
        }

        // If the wage chunks are split exactly at a year boundary and the rates
        // match the session rates, then we *are* derivable.
        if (
            (chunk1.end_date || "").slice(5, 10) === "12-31" &&
            (chunk2.start_date || "").slice(5, 10) === "01-01" &&
            chunk1.rate === session.rate1 &&
            chunk2.rate === session.rate2
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Prepare a minimal representation of the specified object suitable for
 * export. The returned object will contain exactly the fields needed to
 * perfectly reconstruct the object on import an no others. E.g., instructors
 * referenced by a position will only be referenced by UTORid (and won't have information
 * about their names, etc.).
 *
 * These function also strips all `id` fields, since these are database specific and
 * not used when importing.
 */
export const prepareMinimal = {
    session: function (session: Session): MinimalSession {
        return {
            name: session.name,
            start_date: session.start_date,
            end_date: session.end_date,
            rate1: session.rate1,
            rate2: session.rate2,
        };
    },
    contractTemplate: function (
        contractTemplate: ContractTemplate
    ): MinimalContractTemplate {
        return {
            template_name: contractTemplate.template_name,
            template_file: contractTemplate.template_file,
        };
    },
    instructor: function (instructor: Instructor): MinimalInstructor {
        return {
            first_name: instructor.first_name,
            last_name: instructor.last_name,
            utorid: instructor.utorid,
            email: instructor.email,
        };
    },
    position: function (position: Position): MinimalPosition {
        return {
            position_code: position.position_code,
            position_title: position.position_title,
            hours_per_assignment: position.hours_per_assignment,
            start_date: position.start_date,
            end_date: position.end_date,
            duties: position.duties,
            qualifications: position.qualifications,
            desired_num_assignments: position.desired_num_assignments,
            current_enrollment: position.current_enrollment,
            current_waitlisted: position.current_waitlisted,
            instructors: position.instructors.map(
                (instructor) => instructor.utorid
            ),
            contract_template: position.contract_template.template_name,
        };
    },
    wageChunk: function (wageChunk: WageChunk): MinimalWageChunk {
        return {
            start_date: wageChunk.start_date,
            end_date: wageChunk.end_date,
            rate: wageChunk.rate,
            hours: wageChunk.hours,
        };
    },
    assignment: function (
        assignment: Assignment,
        session: Session
    ): MinimalAssignment {
        const ret: MinimalAssignment = {
            utorid: assignment.applicant.utorid,
            position_code: assignment.position.position_code,
        } as MinimalAssignment;
        // If there is an contract_override_pdf, we store it, otherwise
        // the contract comes from the `position` so we don't need to store it.
        if (assignment.contract_override_pdf) {
            ret.contract_override_pdf = assignment.contract_override_pdf;
        }

        // If the start and end dates match the position, there is no need to
        // store them.
        const position = assignment.position;
        if (
            (assignment.start_date &&
                assignment.start_date !== position.start_date) ||
            (assignment.end_date && assignment.end_date !== position.end_date)
        ) {
            ret.start_date = assignment.start_date || position.start_date;
            ret.end_date = assignment.end_date || position.end_date;
        }
        // If there is a single wage chunk and the rate matches the session rate,
        // then just store the number of hours. Otherwise, store the wage chunk(s)
        if (
            !Array.isArray(assignment.wage_chunks) ||
            assignment.wage_chunks.length === 0
        ) {
            ret.hours = assignment.hours;
        } else if (
            session &&
            wageChunksMatchPositionAndSession(
                assignment.wage_chunks,
                position,
                session,
                assignment.hours
            )
        ) {
            // The rate is the same as the session rate, so we don't need to store the
            // wage chunk details
            ret.hours = assignment.hours;
        } else {
            ret.wage_chunks = assignment.wage_chunks.map((chunk) =>
                prepareMinimal.wageChunk(chunk)
            );
        }

        return ret;
    },
    applicant: function (applicant: Applicant): MinimalApplicant {
        return {
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            utorid: applicant.utorid,
            email: applicant.email,
            student_number: applicant.student_number,
            phone: applicant.phone,
        };
    },
    application: function (application: Application): MinimalApplication {
        return Object.assign(prepareMinimal.applicant(application.applicant), {
            annotation: application.annotation,
            comments: application.comments,
            department: application.department,
            gpa: application.gpa,
            program: application.program,
            status: application.status,
            yip: application.yip,
            previous_uoft_experience: application.previous_uoft_experience,
            documents: application.documents,
            custom_question_answers: application.custom_question_answers,
            posting: application.posting?.name || null,
            position_preferences: application.position_preferences.map(
                (position_preference) => ({
                    position_code: position_preference.position.position_code,
                    preference_level: position_preference.preference_level,
                })
            ),
        });
    },
    ddah: function (ddah: Ddah): MinimalDdah {
        const duties = [...ddah.duties];
        duties.sort((a, b) => a.order - b.order);

        return {
            position_code: ddah.assignment.position.position_code,
            applicant: ddah.assignment.applicant.utorid,
            duties: duties.map((duty) => ({
                hours: duty.hours,
                description: duty.description,
            })),
        };
    },
};

/**
 * The function type of a function that creates an upsertable
 * object. I.e., it may or may not have an ID field.
 *
 * @interface PrepareUpsertable
 * @template T - Minimal representation
 * @template U - Full representation
 * @template V - Context attributes that are required to create a full representation
 */

interface PrepareUpsertable<T, U, Context> {
    (minimal: T, context: Omit<Context, "id">): Omit<U, "id">;
    (minimal: T, context: Context): U;
}

interface Context {
    session: Session;
    instructors: Instructor[];
    contractTemplates: ContractTemplate[];
    positions: Position[];
    applicants: Applicant[];
}

interface IdContext extends Context {
    id: number;
}

interface PrepareFull {
    session: PrepareUpsertable<MinimalSession, Session, { id: number }>;
    contractTemplate: PrepareUpsertable<
        MinimalContractTemplate,
        ContractTemplate,
        { id: number }
    >;
    instructor: PrepareUpsertable<
        MinimalInstructor,
        Instructor,
        { id: number }
    >;
    applicant: PrepareUpsertable<MinimalApplicant, Applicant, { id: number }>;
    position: PrepareUpsertable<
        MinimalPosition,
        Position,
        {
            id: number;
            contractTemplates: ContractTemplate[];
            instructors: Instructor[];
        }
    >;
    wageChunk: PrepareUpsertable<MinimalWageChunk, WageChunk, { id: number }>;
    assignment: PrepareUpsertable<
        MinimalAssignment,
        Assignment,
        {
            id: number;
            session: Session;
            applicants: Applicant[];
            positions: Position[];
        }
    >;
    ddah: PrepareUpsertable<
        MinimalDdah,
        Ddah,
        {
            id: number;
            assignments: Assignment[];
        }
    >;
}

export const prepareFull: PrepareFull = {
    session: function (minSession: MinimalSession, context?: any): any {
        const { id } = context || {};
        if (id != null) {
            return { id, ...minSession };
        }
        return minSession;
    },
    contractTemplate: function (
        minContractTemplate: MinimalContractTemplate,
        context?: any
    ): any {
        const { id } = context || {};
        if (id != null) {
            return { id, ...minContractTemplate };
        }
        return minContractTemplate;
    },
    instructor: function (
        minInstructor: MinimalInstructor,
        context?: any
    ): any {
        const { id } = context || {};
        if (id != null) {
            return { id, ...minInstructor };
        }
        return minInstructor;
    },
    applicant: function (minApplicant: MinimalApplicant, context?: any): any {
        const { id } = context || {};
        if (id != null) {
            return { id, ...minApplicant };
        }
        return minApplicant;
    },
    position: function (minPosition: MinimalPosition, context?: any): any {
        const { id, instructors, contractTemplates }: Partial<IdContext> =
            context || {};
        if (!Array.isArray(instructors)) {
            throw new Error(
                "You must pass an array of instructors to reconstruct a position"
            );
        }
        if (!Array.isArray(contractTemplates)) {
            throw new Error(
                "You must pass an array of contract templates to reconstruct a position"
            );
        }

        const ret: Partial<Position> = {
            position_code: minPosition.position_code,
            position_title: minPosition.position_title,
            hours_per_assignment: minPosition.hours_per_assignment,
            start_date: minPosition.start_date,
            end_date: minPosition.end_date,
            duties: minPosition.duties,
            qualifications: minPosition.qualifications,
            desired_num_assignments: minPosition.desired_num_assignments,
            current_enrollment: minPosition.current_enrollment,
            current_waitlisted: minPosition.current_waitlisted,
        };

        // Add in the id if we have it
        if (id != null) {
            ret.id = id;
        }

        // Search for and add the contract template
        const contract_template = contractTemplates.find(
            (template) =>
                template.template_name === minPosition.contract_template
        );
        if (contract_template == null) {
            throw new Error(
                `Couldn't find contract template with name "${minPosition.contract_template}"`
            );
        }
        ret.contract_template = contract_template;

        // Search for an add the list of instructors
        const instructorList = minPosition.instructors.map((utorid) => {
            const match = instructors.find((x) => x.utorid === utorid);
            if (match == null) {
                throw new Error(
                    `Could not find instructor with utorid "${utorid}"`
                );
            }
            return match;
        });
        ret.instructors = instructorList;

        return ret;
    },
    wageChunk: function (minWageChunk: MinimalWageChunk, context?: any): any {
        const { id } = context || {};
        if (id != null) {
            return { id, ...minWageChunk };
        }
        return minWageChunk;
    },
    assignment: function (
        minAssignment: MinimalAssignment,
        context?: any
    ): any {
        const { id, positions, applicants, session }: Partial<IdContext> =
            context || {};
        if (!Array.isArray(positions)) {
            throw new Error(
                "You must pass an array of positions to reconstruct an assignment"
            );
        }
        if (!Array.isArray(applicants)) {
            throw new Error(
                "You must pass an array of applicants to reconstruct an assignment"
            );
        }
        if (!session) {
            throw new Error(
                "You must pass a session to reconstruct an assignment"
            );
        }

        const ret: Partial<Assignment> = {
            contract_override_pdf: minAssignment.contract_override_pdf,
        };

        // Add in the id if we have it
        if (id != null) {
            ret.id = id;
        }

        if (minAssignment.hours != null) {
            ret.hours = minAssignment.hours;
        }

        // Attach the position
        const position = positions.find(
            (x) => x.position_code === minAssignment.position_code
        );
        if (position == null) {
            throw new Error(
                `Cannot find position with position code "${minAssignment.position_code}"`
            );
        }
        ret.position = position;

        // Attach the applicant
        const applicant = applicants.find(
            (x) => x.utorid === minAssignment.utorid
        );
        if (applicant == null) {
            throw new Error(
                `Couldn't find applicant with UTORid "${minAssignment.utorid}"`
            );
        }
        ret.applicant = applicant;

        // Attach the wage chunks
        if (Array.isArray(minAssignment.wage_chunks)) {
            let hours = 0;
            for (const chunk of minAssignment.wage_chunks) {
                hours += chunk.hours;
            }
            ret.hours = hours;
            ret.wage_chunks = minAssignment.wage_chunks as WageChunk[];
        }

        // Compute the start and end dates
        ret.start_date = minAssignment.start_date || position.start_date;
        ret.end_date = minAssignment.end_date || position.end_date;

        return ret;
    },
    ddah: function (minDdah: MinimalDdah, context?: any): any {
        const { id, assignments }: { id?: number; assignments?: Assignment[] } =
            context || {};
        if (!Array.isArray(assignments)) {
            throw new Error(
                "You must pass an array of assignments to reconstruct a ddah"
            );
        }
        const matchingAssignment = assignments.find(
            (assignment) =>
                assignment.applicant.utorid === minDdah.applicant &&
                assignment.position.position_code === minDdah.position_code
        );
        if (!matchingAssignment) {
            throw new Error(
                `Cannot find assignment corresponding to '${minDdah.position_code}' and UTORid '${minDdah.applicant}'`
            );
        }
        const duties = minDdah.duties.map((duty, i) => ({
            ...duty,
            order: i + 1,
        }));

        let total_hours = 0;
        for (const duty of duties) {
            total_hours += duty.hours;
        }

        if (id == null) {
            return {
                assignment: matchingAssignment,
                duties,
                total_hours,
                status: null,
            };
        }
        return {
            id,
            assignment: matchingAssignment,
            duties,
            total_hours,
            // We cannot import "signed" DDAHs, so the `status` is always null
            status: null,
        };
    },
};
