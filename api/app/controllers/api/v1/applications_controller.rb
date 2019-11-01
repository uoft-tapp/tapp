# frozen_string_literal: true

# Controller for Applications
class Api::V1::ApplicationsController < ApplicationController
    before_action :find_application, except: :index

    # GET /applications
    def index
        if params[:session_id].blank?
            render_success Application.all_applications.as_json
            return
        end
        return if invalid_id?(Session, :session_id)

        render_success Application.by_session
    end

    # POST /applications
    def create
        if params[:id].present? && @application.present?
            update
            return
        end

        return if invalid_id?(Applicant, :applicant_id) || invalid_id?(Session, :session_id)

        ActiveRecord::Base.transaction do
            application = Application.create!(application_params)
            matching = ApplicantDataForMatching.create!(applicant_data_for_matching_params)
            error_messages = application.errors.messages.deep_merge(matching.errors.messages)
            if !error_messages
                render_success application.as_json
            else
                render_error error_messages
            end
        rescue StandardError
            if application.errors? && !matching
                render_error application.errors
            elsif matching.errors?
                render_error matching.errors
            else
                render_error 'Something went wrong'
            end
            raise ActiveRecord::Rollback
        end
    end

    def update
        matching = @application.applicant_data_for_matching
        ActiveRecord::Base.transaction do
            application = application.update_attributes!(application_update_params)
            matching = matching.update_attributes!(matching_data_update_params)
            render_success application.as_json
        rescue StandardError
            errors = application.errors.messages.deep_merge(matching.errors.messages)
            render_error errors
        end
    end

    # POST /applications/delete
    def delete
        if @application.destroy!
            render_success @application.as_json
        else
            render_error @application.errors.full_messages.join('; ')
        end
    end

    private

    def find_application
        @application = Application.find_by(id: params[:id])
    end

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
end
