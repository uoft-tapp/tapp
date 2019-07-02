# frozen_string_literal: true

module Api::V1
    # Controller for Applications
    class ApplicationsController < ApplicationController

        # GET /applications
        def index
            if not params.include?(:session_id)
                render_success(Application.order(:id))
                return
            end
            if invalid_id(Session, :session_id) then return end
            render_success(applications_by_session)
        end

        # POST /applications
        def create
            if invalid_id(Session, :session_id) then return end
            application = Application.new(application_params)
            if not application.save # does not pass Application model validation
                render_error(application.errors)
            end
            params[:application_id] = application[:id]
            message = valid_applicant_matching_data
            if not message
                render_success(application)
            else
                render_error(message)
            end
        end

        # PUT/PATCH /applications/:id
        def update
            application = Application.find(params[:id])
            matching = ApplicantDataForMatching.find(application[:id])
            application_res = application.update_attributes!(application_update_params)
            matching_res = matching.update_attributes!(matching_data_update_params)
            errors = application.errors.messages.deep_merge(matching.errors.messages)
            if application_res and matching_res
                render_success(application)
            else
                render_error(errors)
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

        def application_update_params
            params.permit(
                :comments,
            )
        end

        def matching_data_update_params
            params.permit(
                :program, 
                :department, 
                :previous_uoft_ta_experience, 
                :yip, 
                :annotation,
            )
        end
        
        def applications_by_session
            return Application.order(:id).select do |entry|
                entry[:session_id] == params[:session_id].to_i
            end
        end

        def valid_applicant_matching_data
            if invalid_id(Applicant, :applicant_id) then return end
            matching = ApplicantDataForMatching.new(applicant_data_for_matching_params)
            if matching.save
                return nil
            else
                return matching.errors
            end
        end
    end
end