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
            if invalid_id(Session, :session_id) then return end
            render_success(applicants_by_session)
        end

        # POST /applicants
        def create
            applicant = Applicant.new(applicant_params)
            if applicant.save # passes Applicant model validation
                render_success(applicant)
            else
                applicant.destroy!
                render_error(applicant.errors)
            end
        end

        # PUT/PATCH /applicants/:id
        def update
            applicant = Applicant.find(params[:id])
            if applicant.update_attributes!(applicant_params)
                render_success(applicant)
            else
                render_error(applicant.errors)
            end
        end

        # /applicants/delete or /applicants/:id/delete
        def delete
            params.require(:id)
            applicant = Applicant.find(params[:id])
            if session.destroy!
                render_success(applicant)
            else
                render_error(applicant.errors.full_messages.join("; "))
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
  