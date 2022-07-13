import { Position, Application } from "../../../api/defs/types";
import { ApplicantSummary } from "./types";
import { sum } from "../../../api/mockAPI/utils";

export function getApplicantMatchForPosition(
    applicantSummary: ApplicantSummary,
    position: Position
) {
    return (
        applicantSummary.matches.find(
            (match) => match.positionId === position.id
        ) || null
    );
}

export function getPositionPrefForPosition(
    application: Application,
    position: Position
) {
    return application.position_preferences?.find(
        (positionPref) => positionPref.position.id === position.id
    ) || null;
}

export function getApplicantTotalHoursAssigned(applicantSummary: ApplicantSummary) {
    return sum(
        ...applicantSummary.matches.map((match) => {
            if (
                match.status === "assigned" ||
                match.status === "staged-assigned"
            ) {
                return match.hoursAssigned;
            }
            return 0;
        })
    )
}