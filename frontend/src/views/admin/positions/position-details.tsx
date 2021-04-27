import React from "react";
import { upsertPosition } from "../../../api/actions";
import { HasId, Position } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { EditableCell } from "../../../components/editable-cell";
import { EditInstructorsCell } from "./position-list";
import "./style.css";

/**
 * Show the details of a position.
 */
export function PositionsDetails({ position }: { position: Position }) {
    const dispatch = useThunkDispatch();
    function _upsertPosition(position: Partial<Position> & HasId) {
        return dispatch(upsertPosition(position));
    }
    return (
        <React.Fragment>
            <table className="position-details-view essentials">
                <thead>
                    <tr>
                        <th>Position Code</th>
                        <th>Position Title</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <EditableCell
                                column={{ Header: "Position Title" }}
                                upsert={_upsertPosition}
                                field="position_title"
                                row={{ original: position }}
                                value={position.position_title || ""}
                            />
                        </td>
                        <td>
                            <EditableCell
                                column={{ Header: "Position Code" }}
                                upsert={_upsertPosition}
                                field="position_code"
                                row={{ original: position }}
                                value={position.position_code}
                            />
                        </td>
                        <td>
                            <EditableCell
                                column={{ Header: "Start Date" }}
                                upsert={_upsertPosition}
                                field="start_date"
                                row={{ original: position }}
                                value={position.start_date}
                                type="date"
                            />
                        </td>
                        <td>
                            <EditableCell
                                column={{ Header: "End Date" }}
                                upsert={_upsertPosition}
                                field="end_date"
                                row={{ original: position }}
                                value={position.end_date}
                                type="date"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="position-details-view extras">
                <tbody>
                    <tr>
                        <th>Contract Template</th>
                        <td>{position.contract_template.template_name}</td>
                    </tr>
                    <tr>
                        <th>Instructors</th>
                        <td>
                            <EditInstructorsCell
                                row={{
                                    original: position,
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Hours per Assignment</th>
                        <td>
                            <EditableCell
                                column={{ Header: "Hours per Assignment" }}
                                upsert={_upsertPosition}
                                field="hours_per_assignment"
                                row={{ original: position }}
                                value={position.hours_per_assignment}
                                type="number"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <hr />
                        </td>
                    </tr>
                    <tr>
                        <th>Duties</th>
                        <td>
                            <EditableCell
                                column={{ Header: "Duties" }}
                                upsert={_upsertPosition}
                                field="duties"
                                row={{ original: position }}
                                value={position.duties}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Qualifications</th>
                        <td>
                            <EditableCell
                                column={{ Header: "Qualifications" }}
                                upsert={_upsertPosition}
                                field="qualifications"
                                row={{ original: position }}
                                value={position.qualifications}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Waitlisted</th>
                        <td>
                            <EditableCell
                                column={{ Header: "Waitlisted" }}
                                upsert={_upsertPosition}
                                field="current_waitlisted"
                                row={{ original: position }}
                                value={position.current_waitlisted}
                                type="number"
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Desired Number of Assignments</th>
                        <td>
                            <EditableCell
                                column={{
                                    Header: "Desired Number of Assignments",
                                }}
                                upsert={_upsertPosition}
                                field="desired_num_assignments"
                                row={{ original: position }}
                                value={position.desired_num_assignments}
                                type="number"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </React.Fragment>
    );
}
