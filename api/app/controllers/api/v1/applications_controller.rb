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
            # if we passed in an id that exists, we want to update
            if params[:id] && Application.exists?(params[:id])
                update and return
            end

            params.require(:applicant_id)
            if invalid_id(Session, :session_id) then return end
            if invalid_id(Applicant, :applicant_id) then return end
            application = Application.new(application_params)
            if not application.save # does not pass Application model validation
                application.destroy!
                render_error(application.errors)
                return
            end
            params[:application_id] = application[:id]
            message = valid_applicant_matching_data(application.errors.messages)
            if not message
                render_success(application)
            else
                application.destroy!
                render_error(message)
            end
        end

        # PUT/PATCH /applications/:id
        def update
            application = Application.find(params[:id])
            matching = ApplicantDataForMatching.find_by!(application_id: application[:id])
            application_res = application.update_attributes!(application_update_params)
            matching_res = matching.update_attributes!(matching_data_update_params)
            errors = application.errors.messages.deep_merge(matching.errors.messages)
            if application_res and matching_res
                render_success(application)
            else
                render_error(errors)
            end
        end

        # /applications/delete or /applications/:id/delete
        def delete
            params.require(:id)
            application = Application.find(params[:id])
            if application
                applicant_data_for_matching = ApplicantDataForMatching.find_by(
                    application_id: params[:id])
                applicant_data_for_matching.destroy!
            end
            if application.destroy!
                render_success(application)
            else
                render_error(application.errors.full_messages.join("; "))
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

        def valid_applicant_matching_data(errors)
            if invalid_id(Applicant, :applicant_id) then return end
            matching = ApplicantDataForMatching.new(applicant_data_for_matching_params)
            if matching.save
                return nil
            else
                matching.destroy!
                return errors.deep_merge(matching.errors.messages)
            end
        end
    end
end