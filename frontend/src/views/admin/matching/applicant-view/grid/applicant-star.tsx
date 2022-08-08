import React from "react";
import classNames from "classnames";
import { Match } from "../../types";
import { BsStarFill } from "react-icons/bs";
import "../../styles.css";

/**
 * A button for toggling applicant's "starred" status for the currently-selected position.
 */
export function ApplicantStar({
    match,
    updateApplicantMatch,
}: {
    match: Match | null;
    updateApplicantMatch: Function;
}) {
    function _onClick() {
        if (match) {
            if (match.status === "applied" || match.status === "hidden") {
                updateApplicantMatch("starred");
            } else if (match.status === "starred") {
                updateApplicantMatch("applied");
            }
        }
    }

    return (
        <BsStarFill
            className={classNames("star-icon", {
                filled: match?.status === "starred",
            })}
            onClick={_onClick}
        />
    );
}
