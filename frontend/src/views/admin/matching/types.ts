import { Position, Applicant, Assignment, Application } from "../../../api/defs/types";

export type Match = {
    applicant: Applicant;
    position: Position;
    status: "applied" | "starred" | "staged-assigned" | "assigned" | "hidden";
    hoursAssigned: number;
}

export type AppointmentGuaranteeStatus = {
    applicant: Applicant;
    totalHoursOwed: number;
    previousHoursFulfilled: number;
}

export type PositionSummary = {
    position: Position;
    hoursAssigned: number;
    filledStatus: "empty" | "under" | "matched" | "over";
    assignments: Assignment[];
    applicantSummaries: ApplicantSummary[];
};

export type ApplicantSummary = {
    applicant: Applicant;
    mostRecentApplication: Application;
    matches: Match[];
    guarantee: AppointmentGuaranteeStatus | null;
}