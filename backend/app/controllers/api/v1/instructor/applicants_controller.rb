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

        # The applications visible to the instructor are those with an accepted/pending
        # offer for a position the instructor is assigned to OR, if the `applications_visible_to_instructors`
        # flag on a session is set, then the instructor can also see applications that indicated
        # a positive preference for a position the instructor is assigned to.
        always_visible_applicants =
            Applicant.by_session(params[:session_id])
                .with_pending_or_accepted_offer.assigned_to_instructor(
                active_instructor
            )
        sometimes_visible_applicants =
            Applicant.by_session(params[:session_id]).by_visible_to_instructors
                .applied_to_position_for_instructor(active_instructor)
        visible_applicants =
            (always_visible_applicants + sometimes_visible_applicants).uniq
        # We are out of the realm of ActiveRecordQuerys now, so we need to use
        # regular array methods to sort.
        visible_applicants.sort! do |a, b|
            [a.last_name, a.first_name] <=> [b.last_name, b.first_name]
        end

        # An instructor should not have access to the applicant's phone number;
        # Since ActiveModelSerializers cannot have different serializers for different routes
        # https://github.com/rails-api/active_model_serializers/issues/2186
        # we set the sensitive data to `nil` before sending it to the serializer.
        # We are not calling .save! on these object, so it is okay to directly override private
        # fields with `nil`.
        render_success(
            visible_applicants.map do |applicant|
                applicant.phone = nil
                applicant
            end
        )
    end
end
