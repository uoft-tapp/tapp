# frozen_string_literal: true

module Api::V1
  # Controller for Applications
  class ApplicationsController < ApplicationController
    # GET /applications
    def index
      unless params.include?(:session_id)
        render_success(all_applications)
        return
      end
      return if invalid_id(Session, :session_id)

      render_success(applications_by_session)
    end

    # POST /applications
    def create
      # if we passed in an id that exists, we want to update
      update && return if params.key?(:id) && Application.exists?(params[:id])
      params.require(:applicant_id)
      return if invalid_id(Session, :session_id)
      return if invalid_id(Applicant, :applicant_id)

      application = Application.new(application_params)
      unless application.save # does not pass Application model validation
        application.destroy!
        render_error(application.errors)
        return
      end
      params[:application_id] = application[:id]
      message = valid_applicant_matching_data(application.errors.messages)
      if !message
        render_success(application_data(application))
      else
        application.destroy!
        render_error(message)
      end
    end

    def update
      application = Application.find(params[:id])
      matching = application.applicant_data_for_matching
      application_res = application.update_attributes!(application_update_params)
      matching_res = matching.update_attributes!(matching_data_update_params)
      errors = application.errors.messages.deep_merge(matching.errors.messages)
      if application_res && matching_res
        render_success(application_data(application))
      else
        render_error(errors)
      end
    end

    # POST /applications/delete
    def delete
      params.require(:id)
      application = Application.find(params[:id])
      entry = application_data(application)
      if application
        matching = application.applicant_data_for_matching
        matching.destroy!
      end
      if application.destroy!
        render_success(entry)
      else
        render_error(application.errors.full_messages.join('; '))
      end
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
      all_applications.select do |entry|
        entry[:session_id] == params[:session_id].to_i
      end
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
