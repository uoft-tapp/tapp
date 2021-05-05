import {
    WageChunk,
    Position,
    Assignment,
    MinimalWageChunk,
    MinimalSession,
    MinimalPosition,
    MinimalInstructor,
    MinimalAssignment,
    MinimalContractTemplate,
    MinimalApplicant,
    MinimalDdah,
    Session,
    Instructor,
    ContractTemplate,
    Applicant,
    Ddah,
    MinimalPosting,
    Posting,
    PostingPosition,
} from "../../api/defs/types";

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

export interface IdContext extends Context {
    id: number;
}

export interface PrepareFull {
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
    posting: PrepareUpsertable<
        MinimalPosting,
        Posting,
        {
            id: number;
            positions: Position[];
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
    posting: function (minPosting: MinimalPosting, context?: any): any {
        const { id, positions }: { id?: number; positions: Position[] } =
            context || {};
        if (!Array.isArray(positions)) {
            throw new Error(
                "You must pass a positions list to create a posting"
            );
        }
        // We may or may not have an id. We lie to Typescript to keep it from complaining,
        // since we create a posting without an id first and then update it to have an id
        // if needed.
        const ret: Posting = ({
            name: minPosting.name,
            applications: [],
            availability: "auto",
            open_date: minPosting.open_date,
            close_date: minPosting.close_date,
            custom_questions: minPosting.custom_questions,
            intro_text: minPosting.intro_text,
            url_token: "",
            posting_positions: [],
        } as unknown) as Posting;
        let postingPositions: PostingPosition[] = minPosting.posting_positions.map(
            (minPostingPosition) => {
                const position = positions.find(
                    (position) =>
                        position.position_code ===
                        minPostingPosition.position_code
                );
                if (position == null) {
                    throw new Error(
                        `Could not find position corresponding to "${minPostingPosition.position_code}"`
                    );
                }
                return {
                    hours: minPostingPosition.hours,
                    num_positions: minPostingPosition.num_positions,
                    position,
                    posting: ret as Posting,
                };
            }
        );
        if (id != null) {
            ret.id = id;
        }
        ret.posting_positions = postingPositions;
        return ret;
    },
};
