import React from "react";
import { connect } from "react-redux";
import { offerTableSelector } from "../offertable/actions";
import {
    assignmentsSelector,
    wageChunksByAssignmentSelector,
    fetchWageChunksForAssignment,
    upsertWageChunksForAssignment,
} from "../../api/actions";
import { EditableField } from "../../components/edit-field-widgets";
import { Button } from "react-bootstrap";
function AssignmentDetails(props) {
    const {
        assignment,
        wageChunksByAssignment,
        fetchWageChunksForAssignment,
        upsertWageChunksForAssignment,
    } = props;
    const [wageChunks, setWageChunks] = React.useState([]);
    React.useEffect(() => {
        // When the widget loads or the assignment changes, fetch data once.
        fetchWageChunksForAssignment(assignment);
        // We are purposely not including fetchWageChunksForAssignment in the dependency list to avoid an infite loop
        // eslint-disable-next-line
    }, [assignment]);
    React.useEffect(() => {
        // Whenever wage chunk data has changed, we need to rerender
        setWageChunks(wageChunksByAssignment(assignment));
    }, [assignment, wageChunksByAssignment, fetchWageChunksForAssignment]);
    /**
     * Creates an onChange handler for the hours field of wage chunk i
     *
     * @param {number} i
     */
    function changeHoursFactory(i) {
        return function (hours) {
            const newWageChunks = wageChunks.map((chunk, j) => {
                if (i !== j) {
                    return chunk;
                }
                // Update the hours for the specified chunk
                return { ...chunk, hours: +hours };
            });
            upsertWageChunksForAssignment(assignment, newWageChunks);
        };
    }
    return (
        <div>
            <h5>
                {assignment.applicant.first_name}{" "}
                {assignment.applicant.last_name}
            </h5>
            <div>
                {assignment.position.position_code}{" "}
                {assignment.position.position_name}
            </div>
            <div>{assignment.hours} hours</div>
            Wage Chunks:
            <ul>
                {wageChunks.map((chunk, i) => (
                    <li key={i}>
                        <EditableField
                            title="Hours"
                            value={chunk.hours}
                            onChange={changeHoursFactory(i)}
                        >
                            {chunk.hours}
                        </EditableField>{" "}
                        hours at a rate of ${chunk.rate} from {chunk.start_date}{" "}
                        to {chunk.end_date}
                    </li>
                ))}
            </ul>
        </div>
    );
}

const ConnectedAssignmentDetails = connect(
    (state) => ({
        wageChunksByAssignment: wageChunksByAssignmentSelector(state),
    }),
    { fetchWageChunksForAssignment, upsertWageChunksForAssignment }
)(AssignmentDetails);
function ViewAssignmentDetailsButton(props) {
    // Which assignments are selected could change with further UI interaction.
    // So we store a copy of the assignments list as `visibleAssignments` when
    // the view button is clicked
    const selectedAssignments = props.assignments;
    const [visibleAssignments, setVisibleAssignments] = React.useState([]);
    return (
        <React.Fragment>
            <Button onClick={() => setVisibleAssignments(selectedAssignments)}>
                View Selected Assignment Details
            </Button>
            {visibleAssignments.map((assignment, i) => (
                <ConnectedAssignmentDetails assignment={assignment} key={i} />
            ))}
        </React.Fragment>
    );
}
export const ConnectedViewAssignmentDetailsButton = connect((state) => {
    // pass in the currently selected assignments.
    const { selectedAssignmentIds } = offerTableSelector(state);
    const assignments = assignmentsSelector(state);
    return {
        assignments: assignments.filter((x) =>
            selectedAssignmentIds.includes(x.id)
        ),
    };
})(ViewAssignmentDetailsButton);
