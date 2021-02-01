# frozen_string_literal: true

class Api::V1::Instructor::InstructorsController < ApplicationController
    # GET /instructors
    def index
        active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor. If we aren't an instructor, return an empty
        # array.
        active_instructor = Instructor.find_by(utorid: active_user.utorid)
        render_success [] && return unless active_instructor

        # Find the IDs of all instructors that are associated with the same positions we are
        fellow_instructor_ids =
            active_instructor
                .positions
                .joins(:instructors)
                .pluck(:"instructors.id")

        render_success Instructor.order(:utorid).find(fellow_instructor_ids)
    end

    # POST /instructors
    def create
        active_user = ActiveUserService.active_user request

        find_instructor

        # We are only allowed to update information about ourselves, which is determined
        # by the active user having the same utorid as the instructor to be updated.
        unless @instructor.utorid == active_user.utorid
            render_error(
                message:
                    "Insufficient permissions to update instructor with utorid='#{
                        @instructor.utorid
                    }'"
            )
        end

        render_on_condition(
            object: @instructor,
            condition: proc { @instructor.update!(instructor_params) }
        )
    end

    private

    # Find an instructor looking up by `id` first and then by `utorid`
    # if that fails.
    def find_instructor
        @instructor =
            Instructor.find_by(id: params[:id]) ||
                Instructor.find_by!(utorid: params[:utorid])
    end

    def instructor_params
        params.slice(:first_name, :last_name, :email).permit!
    end
end
