import React from "react";
import PropTypes from "prop-types";

export class InstructorsList extends React.Component {
    static propTypes = {
        instructors: PropTypes.arrayOf(
            PropTypes.shape({
                first_name: PropTypes.string,
                last_name: PropTypes.string
            })
        ).isRequired
    };
    render() {
        const { instructors } = this.props;
        let instructorsList = <div>No instructors...</div>;
        if (instructors.length > 0) {
            instructorsList = (
                <ul>
                    {instructors.map(instructor => (
                        <li key={instructor.id}>
                            {instructor.first_name} {instructor.last_name}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div>
                <h3>Available instructors</h3>
                {instructorsList}
            </div>
        );
    }
}
