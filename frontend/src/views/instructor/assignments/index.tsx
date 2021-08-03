import React from "react";
import { ActionsList, ActionHeader } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { InstructorAssignmentsTable } from "./assignments-table";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";
import { activeSessionSelector } from "../../../api/actions";
import { formatDate } from "../../../libs/utils";
import { ConnectedExportAssignmentsAction } from "./import-export";

export function InstructorAssignmentsView() {
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
                    Below is a list of your TAs for{" "}
                    <span className="text-primary">
                        {formattedPositionName}
                    </span>{" "}
                    for the{" "}
                    <span className="text-primary">{formattedSessionName}</span>{" "}
                    session. TAs will only show up in this list if they have been emailed an offer (status <i>pending</i>)
                    or if they have accepted an offer (status <i>accepted</i>). TAs who have rejected an offer or had their offer
                    withdrawn will now show up.
                </p>
                <InstructorAssignmentsTable />
            </ContentArea>
        </div>
    );
}
