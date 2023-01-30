import React from "react";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import {
    toggleStarred,
    toggleAssigned,
    upsertMatch,
    toggleHidden,
} from "../actions";
import { ApplicantSummary } from "../types";

/**
 * Toggle the "stagedAssigned" status of a match.
 */
export function useToggleAssigned(
    positionCode: string,
    utorid: string,
    hoursAssigned?: number
) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        dispatch(
            toggleAssigned({
                positionCode: positionCode,
                utorid: utorid,
                stagedHoursAssigned: hoursAssigned || 0,
            })
        );
    }, [positionCode, utorid, hoursAssigned, dispatch]);
}

/**
 * Toggle the "starred" status of a match.
 */
export function useToggleStarred(positionCode: string, utorid: string) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        dispatch(
            toggleStarred({
                positionCode: positionCode,
                utorid: utorid,
            })
        );
    }, [dispatch, positionCode, utorid]);
}

/**
 * Set a match's "hidden" status for a given applicant and position.
 */
export function useToggleHidden(positionCode: string, utorid: string) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        dispatch(
            toggleHidden({
                positionCode: positionCode,
                utorid: utorid,
            })
        );
    }, [positionCode, utorid, dispatch]);
}

/**
 * Set the "hidden" status for all matches of an applicant to the value of
 * `hide`, given their applicant summary.
 */
export function useHideFromAllPositions({
    applicantSummary,
    hide,
}: {
    applicantSummary: ApplicantSummary;
    hide: boolean;
}) {
    const dispatch = useThunkDispatch();
    return React.useCallback(() => {
        for (const targetMatch of applicantSummary.matches) {
            dispatch(
                upsertMatch({
                    utorid: applicantSummary.applicant.utorid,
                    positionCode: targetMatch.position.position_code,
                    hidden: hide,
                })
            );
        }
    }, [
        dispatch,
        applicantSummary.matches,
        applicantSummary.applicant.utorid,
        hide,
    ]);
}
