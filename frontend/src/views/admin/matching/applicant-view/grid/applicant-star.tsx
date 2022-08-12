import React from "react";
import classNames from "classnames";
import { MatchableAssignment } from "../../types";
import { BsStarFill } from "react-icons/bs";
import { upsertMatch } from "../../actions";
import { useThunkDispatch } from "../../../../../libs/thunk-dispatch";

/**
 * A button for toggling applicant's "starred" status for the currently-selected position.
 */
export function ApplicantStar({ match }: { match: MatchableAssignment }) {
    const dispatch = useThunkDispatch();
    return (
        <BsStarFill
            className={classNames("star-icon", {
                filled: match.status === "starred",
            })}
            onClick={() =>
                dispatch(
                    upsertMatch({
                        positionCode: match.position.position_code,
                        utorid: match.applicant.utorid,
                        starred: match.status !== "starred",
                    })
                )
            }
        />
    );
}
