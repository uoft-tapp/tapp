import React from "react";
import { ActionsList, ActionHeader } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { InstructorApplicationsTable } from "./applications-table";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";
import { activeSessionSelector } from "../../../api/actions";
import { formatDate } from "../../../libs/utils";
import { ConnectedExportAssignmentsAction } from "./import-export";
import { DisplayRating } from "../../../components/applicant-rating";
import { FaRegComment } from "react-icons/fa";

export function InstructorPreferencesView() {
    const activeSession = useSelector(activeSessionSelector);
    const activePosition = useSelector(activePositionSelector);

    if (!activeSession || !activePosition) {
        return (
            <h4>Please select a Session and Position to see TA information</h4>
        );
    }

    const formattedPositionName = `${activePosition.position_code} ${
        activePosition.position_title
            ? ` (${activePosition.position_title})`
            : ""
    }`;
    const formattedSessionName = `${activeSession.name} (${formatDate(
        activeSession.start_date
    )} to ${formatDate(activeSession.end_date)})`;

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Actions</ActionHeader>
                <ConnectedExportAssignmentsAction />
            </ActionsList>
            <ContentArea>
                <h4>
                    <span>{formattedPositionName}</span>
                </h4>
                <p>
                    Below is a of your TAs who have applied for{" "}
                    <span className="text-primary">
                        {formattedPositionName}
                    </span>{" "}
                    for the{" "}
                    <span className="text-primary">{formattedSessionName}</span>{" "}
                    session. You may review a TA's application and indicate
                    which TAs you are most interested in having for your course.
                </p>
                <p>
                    Please indicate whether a TA is <b>suitable</b> (
                    <DisplayRating rating={1} />) for the course,{" "}
                    <b>strongly preferred</b> (
                    <DisplayRating rating={2} />
                    ), or <b>not suitable</b> (
                    <DisplayRating rating={-1} />
                    ). Additionally, you may leave a comment by clicking the "
                    <FaRegComment />" icon. If you don't have enough information
                    to rate the applicant, leave the rating blank or{" "}
                    <b>unknown</b> (
                    <DisplayRating rating={0} />
                    ).
                </p>
                <p>
                    Please note that while your preferences will be taken into
                    account to the best of the TA Coordinator's ability, there
                    are many constraints when assigning TAs and the final TA
                    assignments may not match your preferences.
                </p>
                <InstructorApplicationsTable />
            </ContentArea>
        </div>
    );
}
