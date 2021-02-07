# frozen_string_literal: true

class Api::V1::Instructor::SessionsController < ApplicationController
    # GET /sessions
    def index
        active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor. If we aren't an instructor, return an empty
        # array.
        active_instructor = Instructor.find_by(utorid: active_user.utorid)
        render_success([]) && return unless active_instructor

        # Find the IDs of all instructors that are associated with the same positions we are
        session_ids = active_instructor.positions.pluck(:session_id).uniq

        render_success Session.order(:id).find(session_ids)
    end
end
