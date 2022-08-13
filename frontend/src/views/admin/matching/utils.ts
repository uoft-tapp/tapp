import { Position, Application } from "../../../api/defs/types";
import { ApplicantSummary } from "./types";

export function getApplicantMatchForPosition(
    applicantSummary: ApplicantSummary,
    position: Position | null
) {
    if (!position || !applicantSummary || !applicantSummary.matches) {
        return null;
    }

    return (
        applicantSummary.matches.find(
            (match) => match.position.position_code === position.position_code
        ) || null
    );
}

export function getPositionPrefForPosition(
    application: Application | null,
    position: Position
) {
    if (!application) {
        return null;
    }

    return (
        application.position_preferences?.find(
            (positionPref) => positionPref.position.id === position.id
        ) || null
    );
}
