import React from "react";
import PropTypes from "prop-types";

function AssignmentsList(props) {
    const { assignments } = props;
    let assignmentsList = <div>No assignments...</div>;
    if (assignments.length > 0) {
        assignmentsList = (
            <ul>
                {assignments.map(assignment => (
                    <li key={assignment.id}>
                        {assignment.position.position_code} ({assignment.hours}{" "}
                        hours): {assignment.applicant.first_name}{" "}
                        {assignment.applicant.last_name}
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
AssignmentsList.propTypes = {
    assignments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            position: PropTypes.object,
            applicant: PropTypes.object
        })
    ).isRequired
};

export { AssignmentsList };
