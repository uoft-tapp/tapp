# frozen_string_literal: true

module Api::V1
    # Controller for Applications
    class ApplicationsController < ApplicationController

        # GET /applications
        def index
            if not params.require(:session_id)
                render json: { status: 'success', message: '', payload: Application.order(:id) }
                return
            end
            if Session.exists?(id: params[:session_id])
                render json: { status: 'success', message: '', payload: applications_by_session }
            else
                render json: { status: 'error', message: 'Invalid session_id', payload: {} }
            end
        end

        # POST /applications
        def create
            if not Session.exists?(id: params[:session_id])
                render json: { status: 'error', 
                    message: 'Invalid session_id', payload: applications_by_session }
                return
            end
            application = Application.new(application_params)
            if not application.save # does not pass Application model validation
                render json: { status: 'error', message: application.errors, payload: {} }
            end
            params[:application_id] = application[:id]
            message = valid_matching
            if not message
                render json: { status: 'error', message: '', payload: application }
            else
                render json: { status: 'error', message: message, payload: {} }
            end
        end

        private
        def application_params
            params.permit(
                :comments,
                :session_id,
            )
        end
        def applicant_data_for_matching_params
            params.permit(
                :program, 
                :department, 
                :previous_uoft_ta_experience, 
                :yip, 
                :annotation,
                :applicant_id,
                :application_id,
            )
        end

        def applications_by_session
            return Application.order(:id).select do |entry|
                entry[:session_id] == params[:session_id].to_i
            end
        end

        def valid_matching
            if not Applicant.exists?(id: params[:applicant_id])
                return 'Invalid applicant_id'
            end
            matching = ApplicantDataForMatching.new(applicant_data_for_matching_params)
            if matching.save
                return nil
            else
                return matching.errors
            end
        end
    end
end