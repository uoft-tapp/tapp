# frozen_string_literal: true

module Api::V1
    # Controller for Applicants
    class ApplicantsController < ApplicationController

        # GET /applicants
        def index
            if not params.include?(:session_id)
                render_success(Applicant.order(:id))
                return
            end
            if invalid_primary_key(Session, :session_id)
                return
            end
            render_success(applicants_by_session)
        end

        # POST /applicants
        def create
            applicant = Applicant.new(applicant_params)
            if applicant.save # passes Session model validation
                render_success(applicant)
            else
                render_error(applicant.errors)
            end
        end
 
        private
        def applicant_params
            params.permit(
                :email,
                :first_name,
                :last_name,
                :phone,
                :student_number,
                :utorid,
            )
        end

        def applicants_by_session
            return Applicant.order(:id).select do |entry|
                entry[:session_id] == params[:session_id].to_i
            end
        end
    end
end
  