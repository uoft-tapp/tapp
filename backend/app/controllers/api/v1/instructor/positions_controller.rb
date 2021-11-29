# frozen_string_literal: true

class Api::V1::Instructor::PositionsController < ApplicationController
    def index
        active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor. If we aren't an instructor, return an empty
        # array.
        active_instructor = Instructor.find_by(utorid: active_user.utorid)
        render_success([]) && return unless active_instructor

        render_success Position.by_session(params[:session_id]).by_instructor(
                           active_instructor
                       ).order(:position_code)
    end
end
