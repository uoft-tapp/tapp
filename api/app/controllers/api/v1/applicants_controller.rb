# frozen_string_literal: true

module Api::V1
    # Controller for Applicants
    class ApplicantsController < ApplicationController
        # GET /applicants
        def index
            index_response(Applicant, Session, applicants_by_session)
        end

        # POST /applicants
        def create
            update && return if update_condition(Applicant)
            create_entry(Applicant, applicant_params)
        end

        def update
            update_entry(Applicant, applicant_params)
        end

        # POST /applicants/delete
        def delete
            delete_entry(Applicant)
        end

        private

        def applicant_params
            params.permit(
                :email,
                :first_name,
                :last_name,
                :phone,
                :student_number,
                :utorid
            )
        end

        def applicants_by_session
            filter_given_id(Applicant, :session_id)
        end
    end
end
