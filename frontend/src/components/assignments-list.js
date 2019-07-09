import React from "react";
import PropTypes from "prop-types";

export class AssignmentsList extends React.Component {
    static propTypes = {
        assignments: PropTypes.arrayOf(
            PropTypes.shape({
                position_id: PropTypes.string,
                applicant_id: PropTypes.string
            })
        ).isRequired
    };
    render() {
        const { assignments } = this.props;
        let assignmentsList = <div>No assignments...</div>;
        if (assignments.length > 0) {
            assignmentsList = (
                <ul>
                    {assignments.map(assignment => (
                        <li key={assignment.id}>
                            Assigned applicant # {assignment.applicant_id} to
                            position # {assignment.position_id}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div>
                <h3>Available Assignments</h3>
                {assignmentsList}
            </div>
        );
    }
}
