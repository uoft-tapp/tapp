import {
    Position,
    Applicant,
    Assignment,
    Application,
} from "../../../api/defs/types";

export type Match = {
    applicantId: number;
    utorid: string;
    positionId: number;
    positionCode: string;
    status: "applied" | "starred" | "staged-assigned" | "assigned" | "hidden";
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
    filledStatus: "empty" | "under" | "matched" | "over";
    assignments: Assignment[];
    applicantSummaries: ApplicantSummary[];
};

export type ApplicantSummary = {
    applicant: Applicant;
    application: Application;
    matches: Match[];
    guarantee: AppointmentGuaranteeStatus | null;
};
