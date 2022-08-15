import {
    Position,
    Applicant,
    Assignment,
    Application,
} from "../../../api/defs/types";

// stored in redux
export type RawMatch = {
    utorid: string;
    positionCode: string;
    stagedHoursAssigned?: number;
    stagedAssigned?: boolean;
    starred?: boolean;
    hidden?: boolean;
};

export type AppointmentGuaranteeStatus = {
    utorid: string;
    minHoursOwed: number;
    maxHoursOwed: number;
    previousHoursFulfilled: number;
};

export type ApplicantSummary = {
    applicant: Applicant;
    application: Application | null;
    matches: MatchableAssignment[];
    guarantee: AppointmentGuaranteeStatus | null;
    note: string | null;
    hoursAssigned: number;
    filledStatus: FillStatus;
};

export type MatchableAssignment = {
    position: Position;
    applicant: Applicant;
    hoursAssigned: number;
    status: MatchStatus;
};

export type PositionSummary = {
    position: Position;
    hoursAssigned: number;
    filledStatus: FillStatus;
    applicantSummaries: ApplicantSummary[];
};

export type ApplicantViewMode = "table" | "grid";
export type MatchStatus =
    | "applied"
    | "starred"
    | "staged-assigned"
    | "assigned"
    | "hidden";
export type FillStatus = "empty" | "under" | "matched" | "over" | "n/a";
