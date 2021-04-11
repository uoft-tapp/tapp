/**
 * Internal types are those that are returned by the reducers, etc. when
 * querying from the Redux store. They may differ from the raw API payloads
 * (whose types are defined in the `raw-types.ts` file.)
 */
import type { UserRole } from "./common";
import type {
    RawApplicant,
    RawApplication,
    RawAssignment,
    RawContractTemplate,
    RawDdah,
    RawDuty,
    RawInstructor,
    RawPosition,
    RawPosting,
    RawPostingPosition,
    RawSession,
    RawUser,
    RawWageChunk,
} from "./raw-types";

export type Duty = RawDuty;
export type WageChunk = Omit<RawWageChunk, "assignment_id">;
export type ContractTemplate = RawContractTemplate;
export type Instructor = RawInstructor;
export type Applicant = RawApplicant;
export type Session = RawSession;
export type User = RawUser;

export interface Ddah extends Omit<RawDdah, "assignment_id"> {
    assignment: Assignment;
    duties: Duty[];
    total_hours: number;
    status: "accepted" | "emailed" | null;
}

export interface Assignment
    extends Omit<RawAssignment, "applicant_id" | "position_id"> {
    applicant: Applicant;
    position: Position;
    wage_chunks: WageChunk[];
}

export interface Position
    extends Omit<RawPosition, "contract_template_id" | "instructor_ids"> {
    contract_template: ContractTemplate;
    instructors: Instructor[];
}

export interface ActiveUser extends Omit<User, "id"> {
    id: number | null;
    active_role: UserRole;
}

export interface Posting
    extends Omit<RawPosting, "posting_position_ids" | "application_ids"> {
    posting_positions: PostingPosition[];
    applications: Application[];
}

export interface Application
    extends Omit<
        RawApplication,
        "applicant_id" | "posting_id" | "position_preferences"
    > {
    applicant: Applicant;
    posting: Posting | null;
    position_preferences: { position: Position; preference_level: number }[];
}

export interface PostingPosition
    extends Omit<RawPostingPosition, "position_id" | "posting_id"> {
    position: Position;
    posting: Posting;
}
