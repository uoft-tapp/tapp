/*
 * Types used by the internal API.
 */

export type Role = "admin" | "instructor" | "ta";

export type Utorid = string;

// Minimal types contain the minimum amount of information needed to reconstruct
// a particular object. They lack IDs and may be flat compared to what is actually used
// by the API
export interface MinimalSession {
    name: string;
    start_date: string;
    end_date: string;
    rate1: number;
    rate2: number | null;
}

export interface MinimalContractTemplate {
    template_name: string;
    template_file: string;
}

export interface MinimalInstructor {
    first_name: string;
    last_name: string;
    utorid: Utorid;
    email: string;
}

export interface MinimalPosition {
    position_code: string;
    position_title: string;
    hours_per_assignment?: number;
    start_date: string;
    end_date: string;
    duties?: string;
    qualifications?: string;
    desired_num_assignments?: number;
    current_enrollment?: number;
    current_waitlisted?: number;
    instructors: Utorid[];
    contract_template: string;
}

export interface MinimalWageChunk {
    start_date?: string;
    end_date?: string;
    rate?: number;
    hours: number;
}

export interface MinimalAssignment {
    utorid: Utorid;
    position_code: string;
    contract_override_pdf?: string;
    start_date?: string;
    end_date?: string;
    hours?: number;
    wage_chunks?: MinimalWageChunk[];
}

export interface MinimalApplicant {
    first_name: string;
    last_name: string;
    utorid: Utorid;
    student_number: string;
    email: string;
    phone: string;
}

export interface MinimalDdah {
    position_code: string;
    applicant: Utorid;
    duties: { hours: number; description: string }[];
}

export interface MinimalPostingPosition {
    position_code: string;
    posting_name: string;
    hours: number;
    num_positions: number;
}

export interface PostingPosition extends MinimalPostingPosition {}

export interface MinimalPosting {
    name: string;
    open_date: string;
    close_date: string;
    intro_text?: string;
    availability?: "auto" | "open" | "closed";
    posting_positions: MinimalPostingPosition[];
}

export interface Posting extends MinimalPosting {
    id: number;
    url_token: string;
}

/**
 * A duty that is part of a DDAH.
 *
 * @export
 * @interface Duty
 */
export interface Duty {
    order: number;
    hours: number;
    description: string;
}
export interface Session extends MinimalSession {
    id: number;
}

export interface ContractTemplate extends MinimalContractTemplate {
    id: number;
}

export interface Instructor extends MinimalInstructor {
    id: number;
}

export interface Position
    extends Omit<MinimalPosition, "instructors" | "contract_template"> {
    id: number;
    instructors: Instructor[];
    contract_template: ContractTemplate;
}

export interface WageChunk extends MinimalWageChunk {
    id: number;
}

export interface Assignment {
    id: number;
    position: Position;
    applicant: Applicant;
    hours: number;
    start_date: string;
    end_date: string;
    contract_override_pdf: string;
    active_offer_status?: string;
    active_offer_url_token?: string;
    active_offer_recent_activity_date?: string;
    active_offer_nag_count?: number;
    wage_chunks?: WageChunk[];
}

export interface Applicant extends MinimalApplicant {
    id: number;
}

export interface Ddah {
    id: number;
    assignment: Assignment;
    signature?: string;
    approved_date?: string | null;
    accepted_date?: string | null;
    revised_date?: string | null;
    emailed_date?: string | null;
    url_token: string;
    duties: Duty[];
    total_hours: number;
    status: "accepted" | "emailed" | null;
}

export type UserRole = "admin" | "instructor" | "ta";
export interface User extends HasId {
    utorid: string;
    roles: UserRole[];
}

export interface ActiveUser extends Omit<User, "id"> {
    id: number | null;
    active_role: UserRole;
}

// The Raw* types are the types returned by the API

interface HasId {
    id: number;
}
export interface RawSession extends HasId {
    start_date: string;
    end_date: string;
    name: string;
    rate1: number;
    rate2: number | null;
}

export interface RawPosition extends HasId {
    position_code: string;
    position_title: string | null;
    hours_per_assignment: number;
    start_date: string;
    end_date: string;
    contract_template_id: number;
    qualifications: string | null;
    duties: string | null;
    desired_num_assignments: number | null;
    current_enrollment: number | null;
    current_waitlisted: number | null;
    instructor_ids: number[];
}

export interface RawApplicant extends HasId {
    utorid: string;
    student_number: string | null;
    first_name: string;
    last_name: string | null;
    email: string | null;
    phone: string | null;
}

export interface RawApplication extends HasId {
    applicant_id: number;
    posting_id: number | null;
    comments: string | null;
    program: string | null;
    department: string | null;
    previous_uoft_experience: string | null;
    yip: number | null;
    gpa: number | null;
    status: string | null;
    custom_question_answers: any;
    annotation: string | null;
}

export interface RawAssignment extends HasId {
    applicant_id: number;
    position_id: number;
    start_date: string;
    end_date: string;
    note: string | null;
    contract_override_pdf: string | null;
    active_offer_status:
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "provisional"
        | "pending"
        | "no_offer"
        | null;
    active_offer_url_token: string | null;
    active_offer_recent_activity_date: string | null;
    active_offer_nag_count: number | null;
    hours: number;
}

export interface RawInstructor extends HasId {
    first_name: string;
    last_name: string | null;
    email: string | null;
    utorid: string;
}

export interface RawDdah extends HasId {
    id: number;
    assignment_id: number;
    signature: string | null;
    approved_date: string | null;
    accepted_date: string | null;
    revised_date: string | null;
    emailed_date: string | null;
    url_token: string;
    duties: Duty[];
}

export interface RawPosting extends HasId {
    name: string;
    intro_text: string;
    open_date: string;
    close_date: string;
    availability: "auto" | "open" | "closed";
    custom_questions: any;
    posting_position_ids: number[];
    application_ids: number[];
}

export interface RawPostingPosition {
    position_id: number;
    posting_id: number;
    hours: number;
    num_positions: number;
}

export interface RawContractTemplate extends HasId {
    template_file: string;
    template_name: string;
}

export interface RawWageChunk extends HasId {
    assignment_id: number;
    start_date: string;
    end_date: string;
    hours: number;
    rate: number;
}

export interface RawAttachment {
    file_name: string;
    mime_type: string;
    content: string;
}
