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
    ad_hours_per_assignment?: number;
    ad_num_assignments?: number;
    ad_open_date?: string;
    ad_close_date?: string;
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
    wage_chunks?: WageChunk[];
}

export interface Applicant extends MinimalApplicant {
    id: number;
}
