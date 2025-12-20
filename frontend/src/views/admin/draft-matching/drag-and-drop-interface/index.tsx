import { useSelector } from "react-redux";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
    applicantsSelector,
    applicationsSelector,
    positionsSelector,
} from "../../../../api/actions";
import React from "react";
import { AssignmentDraft, draftAssignmentsSelector } from "../state/slice";
import { ApplicantPill } from "./ApplicantPill";
import { AssignmentRow } from "./AssignmentRow";
import { mergeApplications } from "./mergeApplications";

export function DragAndDropInterface() {
    const positions = useSelector(positionsSelector);
    const applicants = useSelector(applicantsSelector);
    const allUtorids = new Set(applicants.map((a) => a.utorid));
    const applications = useSelector(applicationsSelector);
    const applicationsByUtorid: Map<string, typeof applications> = new Map();
    applications.forEach((application) => {
        if (!applicationsByUtorid.has(application.applicant.utorid)) {
            applicationsByUtorid.set(application.applicant.utorid, []);
        }
        applicationsByUtorid
            .get(application.applicant.utorid)!
            .push(application);
    });
    // A version of applicationsByUtorid where each utorid maps to a single merged application.
    const applicationByUtorid = new Map<string, typeof applications[number]>();
    applicationsByUtorid.forEach((apps, utorid) => {
        if (apps.length === 0) {
            return;
        }
        applicationByUtorid.set(utorid, mergeApplications(apps)!);
    });
    const assignments = useSelector(draftAssignmentsSelector);
    const assignmentsByPosition: Map<string, AssignmentDraft[]> = new Map();
    assignments.forEach((assignment) => {
        const positionCode = assignment.position.position_code;
        if (!assignmentsByPosition.has(positionCode)) {
            assignmentsByPosition.set(positionCode, []);
        }
        assignmentsByPosition
            .get(positionCode)!
            .push(assignment as AssignmentDraft);
    });
    const assignmentsByUtorid: Map<string, AssignmentDraft[]> = new Map();
    assignments.forEach((assignment) => {
        const utorid = assignment.applicant.utorid;
        if (!assignmentsByUtorid.has(utorid)) {
            assignmentsByUtorid.set(utorid, []);
        }
        assignmentsByUtorid.get(utorid)!.push(assignment as AssignmentDraft);
    });

    // console.log("positions", positions);
    // console.log("applicants", applicants);
    // console.log("assignments", assignments);
    // console.log("applications", applications);

    return (
        <PanelGroup
            direction="horizontal"
            autoSaveId="draft-matching-layout"
            className="draft-matching-panel-group"
        >
            <Panel defaultSize={30}>
                <div className="panel applicants-list">
                    {applicants.map((applicant) => (
                        <ApplicantPill
                            key={applicant.id}
                            applicant={applicant}
                            application={applicationByUtorid.get(
                                applicant.utorid
                            )}
                            allAssignments={assignmentsByUtorid.get(
                                applicant.utorid
                            )}
                        />
                    ))}
                </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            <Panel defaultSize={70} className="panel">
                <div className="panel">
                    <div className="assignments-table">
                        {positions.map((position) => {
                            return (
                                <AssignmentRow
                                    key={position.id}
                                    position={position}
                                    assignmentsByPosition={
                                        assignmentsByPosition
                                    }
                                    assignmentsByUtorid={assignmentsByUtorid}
                                    allUtorids={allUtorids}
                                    applicationByUtorid={applicationByUtorid}
                                />
                            );
                        })}
                    </div>
                </div>
            </Panel>
        </PanelGroup>
    );
}
