import React from "react";
import classNames from "classnames";
import { MatchableAssignment } from "../../../types";
import { useToggleStarred } from "../../../match-actions/modify-match-status";
import { BsStarFill } from "react-icons/bs";

/**
 * A button for toggling applicant's "starred" status for the currently-selected position.
 */
export function ApplicantStar({ match }: { match: MatchableAssignment }) {
    const toggleStarred = useToggleStarred(
        match.position.position_code,
        match.applicant.utorid
    );

    return (
        <BsStarFill
            className={classNames("star-icon", {
                filled: match.status === "starred",
            })}
            onClick={toggleStarred}
        />
    );
}
