import React from "react";
import { ConnectedTAsTable } from "./tas-table";
import { ConnectedExportAssignmentsAction } from "../../admin/assignments/import-export";
import { ActionsList, ActionHeader } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import { activeSessionSelector, assignmentsSelector } from "../../../api/actions";
import { ddahsSelector } from "../../../api/actions/ddahs";
import { Ddah } from "../../../api/defs/types";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { activePositionSelector } from "../store/actions";

export function InstructorAssignmentsView() {
    const activeSession = useSelector(activeSessionSelector);
    const ddahs = useSelector(ddahsSelector);
    const assignments = useSelector(assignmentsSelector);
    const dispatch = useThunkDispatch();
    const activePosition = useSelector(activePositionSelector);

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedExportAssignmentsAction />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify DDAHs, you must select a session." />
                )}
                <ConnectedTAsTable
                    position_id={activePosition?.id || -1}
                    onView={f => f}
                />
            </ContentArea>
        </div>
    );
}
