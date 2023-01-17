import React from "react";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import { upsertMatch } from "../actions";
import { ApplicantSummary, MatchableAssignment } from "../types";

export function AssignApplicantToPosition(
    positionCode: string,
    utorid: string,
    hoursAssigned: number
) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        dispatch(
            upsertMatch({
                positionCode: positionCode,
                utorid: utorid,
                stagedAssigned: true,
                stagedHoursAssigned: hoursAssigned,
            })
        );
    }, [positionCode, utorid, hoursAssigned, dispatch]);
}

export function UnassignApplicantFromPosition(
    positionCode: string,
    utorid: string
) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        dispatch(
            upsertMatch({
                positionCode: positionCode,
                utorid: utorid,
                stagedAssigned: false,
                stagedHoursAssigned: 0,
            })
        );
    }, [positionCode, utorid, dispatch]);
}

export function SetStarred(match: MatchableAssignment, starred: boolean) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        dispatch(
            upsertMatch({
                positionCode: match.position.position_code,
                utorid: match.applicant.utorid,
                starred: starred,
            })
        );
    }, [dispatch, match, starred]);
}

export function SetHiddenFromPosition(
    positionCode: string,
    utorid: string,
    isHidden: boolean
) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        dispatch(
            upsertMatch({
                positionCode: positionCode,
                utorid: utorid,
                hidden: isHidden,
            })
        );
    }, [positionCode, utorid, isHidden, dispatch]);
}

export function SetHiddenFromAllPositions(
    applicantSummary: ApplicantSummary,
    isHidden: boolean
) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        for (const targetMatch of applicantSummary.matches) {
            dispatch(
                upsertMatch({
                    utorid: applicantSummary.applicant.utorid,
                    positionCode: targetMatch.position.position_code,
                    hidden: isHidden,
                })
            );
        }
    }, [
        dispatch,
        applicantSummary.matches,
        applicantSummary.applicant.utorid,
        isHidden,
    ]);
}
