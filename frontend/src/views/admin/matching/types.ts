import {
    Position,
    Applicant,
    Assignment,
    Application,
} from "../../../api/defs/types";

export type Match = {
    utorid: string;
    positionCode: string;
    status: MatchStatus;
    hoursAssigned: number;
};

export type AppointmentGuaranteeStatus = {
    utorid: string;
    totalHoursOwed: number;
    previousHoursFulfilled: number;
};

export type PositionSummary = {
    position: Position;
    hoursAssigned: number;
    filledStatus: FillStatus;
    applicantSummaries: ApplicantSummary[];
};

export type ApplicantSummary = {
    applicant: Applicant;
    application: Application;
    matches: Match[];
    guarantee: AppointmentGuaranteeStatus | null;
    note: string | null;
};

export type ViewType = "table" | "grid";
export type MatchStatus =
    | "applied"
    | "starred"
    | "staged-assigned"
    | "assigned"
    | "hidden";
export type FillStatus = "empty" | "under" | "matched" | "over";
