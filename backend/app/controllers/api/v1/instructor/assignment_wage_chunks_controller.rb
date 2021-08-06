# frozen_string_literal: true

class Api::V1::Instructor::AssignmentWageChunksController < ApplicationController
    before_action :find_instructor, :find_assignment

    # GET /wage_chunks
    def index
        render_success([]) && return unless @active_instructor

        render_success @assignment.wage_chunks
    end

    private

    def find_instructor
        active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor. If we aren't an instructor, return an empty
        # array.
        @active_instructor = Instructor.find_by(utorid: active_user.utorid)
    end

    def find_assignment
        @assignment =
            Assignment.joins(position: :instructors).where(
                position: { instructors: @active_instructor }
            ).find(params[:assignment_id])
    end
end
