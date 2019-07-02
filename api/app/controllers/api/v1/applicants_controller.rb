# frozen_string_literal: true

module Api::V1
    # Controller for Applicants
    class ApplicantsController < ApplicationController

        # GET /applicants
        def index
            if not params.include?(:session_id)
                render json: { status: 'success', message: '', payload: Applicant.order(:id) }
                return
            end
            if Session.exists?(id: params[:session_id])
                render json: { status: 'success', message: '', payload: applicants_by_session }
            else
                render json: { status: 'error', message: 'Invalid session_id', payload: {} }
            end
        end

        # POST /applicants
        def create
            applicant = Applicant.new(applicant_params)
            if applicant.save # passes Session model validation
                render json: { status: 'success', message: '', payload: applicant }
            else
                render json: { status: 'error', message: applicant.errors, payload: {} }
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
  