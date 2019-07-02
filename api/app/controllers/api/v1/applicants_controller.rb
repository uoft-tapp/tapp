# frozen_string_literal: true

module Api::V1
    # Controller for Applicants
    class ApplicantsController < ApplicationController

        # GET /applicants
        def index
            render json: { status: 'success', message: '', payload: Applicant.order(:id) }
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
    end
  end
  