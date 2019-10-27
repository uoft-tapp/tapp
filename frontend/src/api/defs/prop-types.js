import PropTypes from "prop-types";

/**
 * Generate proptypes for API responses using the passed-in proptypes function.
 * This is encapsulated so that `PropTypes` can be replaced (for example, with a proxy
 * used for documentation generation).
 *
 * @param {*} PropTypes - a PropTypes function (coming from the `"prop-types"` module or elsewhere)
 * @returns an object of PropTypes
 */
function generatePropTypes(PropTypes) {
    return {
        apiResponse: PropTypes.shape({
            status: PropTypes.oneOf(["success", "error"]).isRequired,
            message: PropTypes.string,
            payload: PropTypes.any
        }),
        apiResponseSuccess: PropTypes.shape({
            status: PropTypes.oneOf(["success"]).isRequired,
            message: PropTypes.string,
            payload: PropTypes.any
        }),
        apiResponseError: PropTypes.shape({
            status: PropTypes.oneOf(["error"]).isRequired,
            message: PropTypes.string.isRequired,
            payload: PropTypes.any
        }),
        idOnly: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        }),
        session: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            start_date: PropTypes.string,
            end_date: PropTypes.string,
            name: PropTypes.string.isRequired
        }),
        offerTemplateMinimal: PropTypes.shape({
            offer_template: PropTypes.string
        }),
        offerTemplate: PropTypes.shape({
            offer_template: PropTypes.string,
            position_type: PropTypes.string
        }),
        position: PropTypes.shape({
            position_code: PropTypes.string.isRequired,
            position_title: PropTypes.string,
            est_hours_per_assignment: PropTypes.number,
            est_start_date: PropTypes.string,
            est_end_date: PropTypes.string,
            position_type: PropTypes.string,
            duties: PropTypes.string,
            qualifications: PropTypes.string,
            ad_hours_per_assignment: PropTypes.number,
            ad_num_assignments: PropTypes.number,
            ad_open_date: PropTypes.string,
            ad_close_date: PropTypes.string,
            desired_num_assignments: PropTypes.number,
            current_enrollment: PropTypes.number,
            current_waitlisted: PropTypes.number
        }),
        instructor: PropTypes.shape({
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            email: PropTypes.string,
            utorid: PropTypes.string.isRequired
        }),
        assignment: PropTypes.shape({
            contract_start: PropTypes.string,
            contract_end: PropTypes.string,
            note: PropTypes.string,
            offer_override_pdf: PropTypes.string,
            applicant_id: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ]).isRequired,
            position_id: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ]).isRequired
        }),
        applicant: PropTypes.shape({
            utorid: PropTypes.string.isRequired,
            student_number: PropTypes.string,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            email: PropTypes.string,
            phone: PropTypes.string
        }),
        wageChunk: PropTypes.shape({
            start_date: PropTypes.string,
            end_date: PropTypes.string,
            hours: PropTypes.number,
            rate: PropTypes.number
        }),
        reportingTags: PropTypes.shape({
            name: PropTypes.string
        }),
        offer: PropTypes.shape({
            offer_template: PropTypes.string,
            first_name: PropTypes.string,
            last_name: PropTypes.string,
            email: PropTypes.string,
            position_code: PropTypes.string,
            position_title: PropTypes.string,
            position_start_date: PropTypes.string,
            position_end_date: PropTypes.string,
            first_time_ta: PropTypes.bool,
            instructor_contact_desc: PropTypes.string,
            pay_period_desc: PropTypes.string,
            installments: PropTypes.number,
            ta_coordinator_name: PropTypes.string,
            ta_coordinator_email: PropTypes.string,
            emailed_date: PropTypes.string,
            string: PropTypes.string,
            accepted_date: PropTypes.string,
            rejected_date: PropTypes.string,
            withdrawn_date: PropTypes.string
        }),
        application: PropTypes.shape({
            session_id: PropTypes.number,
            comments: PropTypes.string,
            program: PropTypes.string,
            department: PropTypes.string,
            previous_uoft_experience: PropTypes.string,
            yip: PropTypes.number,
            annotation: PropTypes.string,
            applicant_id: PropTypes.number
        })
    };
}

const apiPropTypes = generatePropTypes(PropTypes);

export { apiPropTypes, generatePropTypes };
