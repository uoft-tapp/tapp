# frozen_string_literal: true

# Controller for Applications
class Api::V1::Instructor::ApplicationsController < ApplicationController
    # GET /applications
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
        always_visible_applications =
            Application.by_session(params[:session_id])
                .with_pending_or_accepted_offer.assigned_to_instructor(
                active_instructor
            )
        sometimes_visible_applications =
            Application.by_session(params[:session_id])
                .by_visible_to_instructors.applied_to_position_for_instructor(
                active_instructor
            )
        render_success (
                           always_visible_applications +
                               sometimes_visible_applications
                       ).uniq
    end
end
