import React from "react";
import PropTypes from "prop-types";

export class ApplicantsList extends React.Component {
    static propTypes = {
        applicants: PropTypes.arrayOf(
            PropTypes.shape({
                first_name: PropTypes.string,
                last_name: PropTypes.string
            })
        ).isRequired
    };
    render() {
        const { applicants } = this.props;
        let applicantsList = <div>No Applicants...</div>;
        if (applicants.length > 0) {
            applicantsList = (
                <ul>
                    {applicants.map(applicant => (
                        <li key={applicant.id}>
                            {applicant.first_name} {applicant.last_name}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div>
                <h3>Available Applicants</h3>
                {applicantsList}
            </div>
        );
    }
}
