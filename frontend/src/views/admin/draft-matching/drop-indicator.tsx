import { useSelector } from "react-redux";
import { Applicant, Position } from "../../../api/defs/types";
import {
    AssignmentDraft,
    assignmentKey,
    draftAssignmentsByKeySelector,
} from "./state/slice";
import classNames from "classnames";
import { FaPlus } from "react-icons/fa";

/**
 * An indicator showing what will happen if an applicant is dropped into this spot.
 */
export function AssignmentDropIndicator(props: {
    position: Position;
    applicant: Applicant;
    /**
     * Whether dropping here is forbidden.
     */
    forbidden?: boolean;
    message?: string;
}) {
    return (
        <div
            className={classNames("drop-here-indicator", {
                forbidden: props.forbidden,
            })}
        >
            {!props.forbidden && (
                <div className="allow-message">
                    <div className="icon">
                        <FaPlus />
                    </div>
                    <div className="message">
                        {props.applicant?.first_name}{" "}
                        {props.applicant?.last_name}
                        <br />
                        {props.position?.position_code}
                    </div>
                    <div className="hours">
                        {props.position?.hours_per_assignment}h
                    </div>
                </div>
            )}
            {props.forbidden && props.message && (
                <div className="forbidden-message">{props.message}</div>
            )}
        </div>
    );
}

/**
 * An indicator showing what will happen if an applicant is dropped into this spot.
 * This indicator is connected to the store.
 */
export function ConnectedDropIndicator(props: {
    position: Position;
    applicant: Applicant;
}) {
    const draftAssignmentsByKey = useSelector(draftAssignmentsByKeySelector);
    const existingAssignment = draftAssignmentsByKey.get(
        assignmentKey({
            applicant: props.applicant ?? ({ utorid: "" } as Applicant),
            position: props.position,
        })
    );
    const forbidden = assignmentIsForbidden(
        props.applicant ?? ({ utorid: "" } as Applicant),
        props.position,
        draftAssignmentsByKey
    );
    const message =
        existingAssignment && forbidden
            ? `Existing ${
                  existingAssignment.active_offer_status || ""
              } assignment`
            : undefined;

    return (
        <AssignmentDropIndicator
            {...props}
            forbidden={forbidden}
            message={message}
        />
    );
}

/**
 * Whether the applicant can be assigned to the current position.
 * This is false if there already exists an assignment of the same type that is active (e.g., not withdrawn).
 */
export function assignmentIsForbidden(
    applicant: Applicant,
    position: Position,
    draftAssignmentsByKey: Map<string, AssignmentDraft>,
    hours?: number
) {
    const existingAssignment = draftAssignmentsByKey.get(
        assignmentKey({
            applicant: applicant ?? ({ utorid: "" } as Applicant),
            position: position ?? ({ position_code: "" } as Position),
        })
    );
    if (!existingAssignment) {
        return false;
    }
    // Check the list of conditions that make an assignment in this position forbidden:
    // If there is a non-withdrawn active officer, we cannot create a new assignment.
    return (
        !existingAssignment.deleted ||
        !(
            existingAssignment.active_offer_status === "withdrawn" ||
            existingAssignment.active_offer_status == null
        )
    );
}
