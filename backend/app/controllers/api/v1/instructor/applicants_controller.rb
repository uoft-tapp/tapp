# frozen_string_literal: true

class Api::V1::Instructor::ApplicantsController < ApplicationController
    # GET /applicants
    def index
        active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor. If we aren't an instructor, return an empty
        # array.
        active_instructor = Instructor.find_by(utorid: active_user.utorid)
        render_success([]) && return unless active_instructor

        # An instructor should not have access to the applicant's phone number;
        # Since ActiveModelSerializers cannot have different serializers for different routes
        # https://github.com/rails-api/active_model_serializers/issues/2186
        # we set the sensitive data to `nil` before sending it to the serializer.
        # We are not calling .save! on these object, so it is okay to directly override private
        # fields with `nil`.
        render_success(
            active_instructor.applicants_by_session(params[:session_id])
                .map do |applicant|
                applicant.phone = nil
                applicant
            end
        )
    end
end
