import * as OrigPropTypes from "prop-types";

/**
 * Generate proptypes for API responses using the passed-in proptypes function.
 * This is encapsulated so that `PropTypes` can be replaced (for example, with a proxy
 * used for documentation generation).
 *
 * @param {*} PropTypes - a PropTypes function (coming from the `"prop-types"` module or elsewhere)
 * @returns an object of PropTypes
 */
function generatePropTypes(PropTypes: typeof OrigPropTypes) {
    const id = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

    return {
        apiResponse: PropTypes.shape({
            status: PropTypes.oneOf(["success", "error"]).isRequired,
            message: PropTypes.string,
            payload: PropTypes.any,
        }),
        apiResponseSuccess: PropTypes.shape({
            status: PropTypes.oneOf(["success"]).isRequired,
            message: PropTypes.string,
            payload: PropTypes.any,
        }),
        apiResponseError: PropTypes.shape({
            status: PropTypes.oneOf(["error"]).isRequired,
            message: PropTypes.string.isRequired,
            payload: PropTypes.any,
        }),
        idOnly: PropTypes.shape({
            id,
        }),
        session: PropTypes.shape({
            id,
            start_date: PropTypes.string,
            end_date: PropTypes.string,
            name: PropTypes.string.isRequired,
        }),
        contractTemplateMinimal: PropTypes.shape({
            template_file: PropTypes.string,
        }),
        contractTemplate: PropTypes.shape({
            template_file: PropTypes.string,
            template_name: PropTypes.string,
        }),
        position: PropTypes.shape({
            position_code: PropTypes.string.isRequired,
            position_title: PropTypes.string,
            hours_per_assignment: PropTypes.number,
            start_date: PropTypes.string,
            end_date: PropTypes.string,
            contract_template_id: id,
            duties: PropTypes.string,
            qualifications: PropTypes.string,
            desired_num_assignments: PropTypes.number,
            current_enrollment: PropTypes.number,
            current_waitlisted: PropTypes.number,
            instructor_ids: PropTypes.arrayOf(id),
            instructor_preference: PropTypes.arrayOf(
                PropTypes.shape({
                    preference_level: PropTypes.number,
                    applicant_id: id,
                    instructor_id: id,
                })
            ),
        }),
        instructor: PropTypes.shape({
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            email: PropTypes.string,
            utorid: PropTypes.string.isRequired,
        }),
        assignment: PropTypes.shape({
            start_date: PropTypes.string,
            end_date: PropTypes.string,
            note: PropTypes.string,
            contract_override_pdf: PropTypes.string,
            applicant_id: id.isRequired,
            position_id: id.isRequired,
            active_offer_status: PropTypes.oneOf([
                "accepted",
                "rejected",
                "withdrawn",
                "provisional",
                "pending",
                "no_offer",
                null,
            ]),
            active_offer_url_token: PropTypes.string,
            active_offer_recent_activity_date: PropTypes.string,
            active_offer_nag_count: PropTypes.number,
        }),
        applicant: PropTypes.shape({
            utorid: PropTypes.string.isRequired,
            student_number: PropTypes.string,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            email: PropTypes.string,
            phone: PropTypes.string,
        }),
        wageChunk: PropTypes.shape({
            start_date: PropTypes.string,
            end_date: PropTypes.string,
            hours: PropTypes.number,
            rate: PropTypes.number,
        }),
        reportingTag: PropTypes.shape({
            name: PropTypes.string,
        }),
        offer: PropTypes.shape({
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
            status: PropTypes.string,
            accepted_date: PropTypes.string,
            rejected_date: PropTypes.string,
            withdrawn_date: PropTypes.string,
            url_token: PropTypes.string,
            nag_count: PropTypes.number,
        }),
        application: PropTypes.shape({
            posting_id: id,
            applicant_id: id,
            comments: PropTypes.string,
            program: PropTypes.string,
            department: PropTypes.string,
            previous_uoft_experience: PropTypes.string,
            yip: PropTypes.number,
            annotation: PropTypes.string,
            position_preference: PropTypes.arrayOf(
                PropTypes.shape({
                    preference_level: PropTypes.number,
                    position_id: id,
                })
            ),
        }),
        user: PropTypes.shape({
            utorid: PropTypes.string,
            roles: PropTypes.arrayOf(PropTypes.string),
        }),
        ddah: PropTypes.shape({
            assignment_id: id,
            signature: PropTypes.string,
            approved_date: PropTypes.string,
            accepted_date: PropTypes.string,
            revised_date: PropTypes.string,
            emailed_date: PropTypes.string,
            url_token: PropTypes.string,
            duties: PropTypes.arrayOf(
                PropTypes.shape({
                    description: PropTypes.string,
                    hours: PropTypes.number,
                    order: PropTypes.number,
                })
            ),
        }),
        posting: PropTypes.shape({
            name: PropTypes.string,
            intro_text: PropTypes.string,
            open_date: PropTypes.string,
            close_date: PropTypes.string,
            availability: PropTypes.oneOf(["auto", "open", "closed"]),
            custom_questions: PropTypes.any,
            posting_position_ids: PropTypes.arrayOf(id),
            application_ids: PropTypes.arrayOf(id),
        }),
        posting_position: PropTypes.shape({
            hours: PropTypes.number,
            num_positions: PropTypes.number,
            position_id: id,
            posting_id: id,
        }),
        survey: PropTypes.shape({
            title: PropTypes.string,
            pages: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string,
                    elements: PropTypes.arrayOf(
                        PropTypes.shape({
                            type: PropTypes.string,
                            name: PropTypes.string,
                            title: PropTypes.string,
                        })
                    ),
                })
            ),
        }),
    };
}

const apiPropTypes = generatePropTypes(OrigPropTypes);

export { apiPropTypes, generatePropTypes };
