/**
 * This file contains types that are returned by the backend as responses to API calls.
 */
import type { HasId, UserRole, Utorid } from "./common";

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
    utorid: Utorid;
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
    custom_question_answers: unknown | null;
    annotation: string | null;
    documents: {
        name: string;
        type: string;
        size: number;
        url_token: string;
    }[];
    position_preferences: { position_id: number; preference_level: number }[];
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
    utorid: Utorid;
}

/**
 * A duty that is part of a DDAH.
 *
 * @export
 * @interface RawDuty
 */
export interface RawDuty {
    order: number;
    hours: number;
    description: string;
}

export interface RawDdah extends HasId {
    assignment_id: number;
    approved_date: string | null;
    accepted_date: string | null;
    revised_date: string | null;
    emailed_date: string | null;
    signature: string | null;
    url_token: string;
    duties: RawDuty[];
}

export interface RawPosting extends HasId {
    name: string;
    intro_text: string | null;
    open_date: string | null;
    close_date: string | null;
    availability: "auto" | "open" | "closed";
    custom_questions: { pages: { name: string; [key: string]: any }[] } | null;
    posting_position_ids: number[];
    application_ids: number[];
    url_token: string;
}

export interface RawPostingPosition {
    position_id: number;
    posting_id: number;
    hours: number | null;
    num_positions: number | null;
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

export interface RawOffer extends HasId {
    assignment_id: number;
    first_name: string;
    last_name: string;
    email: string;
    position_code: string;
    position_title: string;
    position_start_date: string;
    position_end_date: string;
    first_time_ta: boolean | null;
    instructor_contact_desc: string;
    pay_period_desc: string;
    installments: null;
    ta_coordinator_name: string;
    ta_coordinator_email: string;
    signature: string | null;
    emailed_date: string | null;
    accepted_date: string | null;
    rejected_date: string | null;
    withdrawn_date: string | null;
    url_token: string;
    nag_count: number;
    status: "provisional" | "pending" | "accepted" | "rejected" | "withdrawn";
    hours: number;
}

export interface RawUser extends HasId {
    utorid: Utorid;
    roles: UserRole[];
}

export interface RawReportingTag {
    name: string;
}
