# frozen_string_literal: true

module Api::V1
    # Controller for Applications
    class ApplicationsController < ApplicationController
        # GET /applications
        def index
            index_response(all_applications, Session, applications_by_session, true)
        end

        # POST /applications
        def create
            # if we passed in an id that exists, we want to update
            update && return if update_condition(Application)
            params.require(:applicant_id)
            return if invalid_id(Session, :session_id)
            return if invalid_id(Applicant, :applicant_id)

            create_subparts = proc do |application|
                params[:application_id] = application[:id]
                message = valid_applicant_matching_data(application.errors.messages)
                if !message
                    render_success(application_data(application))
                else
                    application.destroy!
                    render_error(message)
                end
            end
            create_entry(Application, application_params, after_fn: create_subparts)
        end

        def update
            parts_fn = proc do |application|
                matching = application.applicant_data_for_matching
                matching_res = matching.update_attributes!(matching_data_update_params)
                errors = application.errors.messages.deep_merge(matching.errors.messages)
                [matching_res, errors]
            end
            merge_fn = proc { |i| application_data(i) }
            update_entry(Application, application_update_params,
                         parts_fn: parts_fn, merge_fn: merge_fn)
        end

        # POST /applications/delete
        def delete
            delete_matching = proc do |application|
                matching = application.applicant_data_for_matching
                matching.destroy!
            end
            delete_entry(Application, delete_matching)
        end

        private

        def application_params
            params.permit(
                :comments,
                :session_id
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
                :application_id
            )
        end

        def application_update_params
            params.permit(
                :comments
            )
        end

        def matching_data_update_params
            params.permit(
                :program,
                :department,
                :previous_uoft_ta_experience,
                :yip,
                :annotation
            )
        end

        def applications_by_session
            filter_given_id(all_applications, :session_id, true)
        end

        def all_applications
            Application.order(:id).map do |entry|
                application_data(entry)
            end
        end

        def application_data(application)
            exclusion = %i[id created_at updated_at application_id]
            matching = application.applicant_data_for_matching
            matching = json(matching, except: exclusion)
            json(application, include: matching)
        end

        def valid_applicant_matching_data(errors)
            return if invalid_id(Applicant, :applicant_id)

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
