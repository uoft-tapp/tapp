import React from "react";
import { ConnectedOfferTable } from "../../admin/offertable";
import { ConnectedExportAssignmentsAction } from "../../admin/assignments/import-export";
import { ActionsList, ActionHeader } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";

export function InstructorAssignmentsView() {
    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedExportAssignmentsAction />
            </ActionsList>
            <ContentArea>
                <ConnectedOfferTable editable={false} />
            </ContentArea>
        </div>
    );
}
