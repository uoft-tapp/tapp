# frozen_string_literal: true

class Api::V1::Instructor::InstructorPreferencesController < ApplicationController
    before_action :find_instructor

    # GET /sessions/:session_id/instructor_preferences
    def index
        render_success([]) && return unless @active_instructor

        render_success InstructorPreference.by_visible_to_instructors
                           .by_instructor(@active_instructor).by_session(
                           params[:session_id]
                       )
    end

    # POST /assignments
    def create
        @instructor_preference =
            InstructorPreference.by_visible_to_instructors.by_instructor(
                @active_instructor
            ).find_by(
                application: params[:application_id],
                position: params[:position_id]
            )
        update && return if @instructor_preference

        validate_application_and_position

        @instructor_preference =
            InstructorPreference.new(instructor_preference_params)
        render_on_condition(
            object: @instructor_preference,
            condition: proc { @instructor_preference.save! }
        )
    end

    private

    def find_instructor
        active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor. If we aren't an instructor, return an empty
        # array.
        @active_instructor = Instructor.find_by(utorid: active_user.utorid)
    end

    # Throw an error unless the instructor is allowed to create an instructor_preference
    # for the application/position pair
    def validate_application_and_position
        # We can only create instructor_preferences when the session marks
        # applications as visible to the instructor.
        #
        # `.find()` will throw an error if it cannot find a match, so we don't need
        # to do anything further.
        position =
            @active_instructor.positions.joins(:session).where(
                session: { applications_visible_to_instructors: true }
            ).find(params[:position_id])
        # Ensure there's an existing application corresponding to the same session.
        Application.where(session: position.session_id).find(
            params[:application_id]
        )
    end

    def instructor_preference_params
        params.permit(
            :application_id,
            :position_id,
            :preference_level,
            :comment
        )
    end

    def update
        render_on_condition(
            object: @instructor_preference,
            condition:
                proc do
                    @instructor_preference.update(instructor_preference_params)
                    @instructor_preference.save!
                end
        )
    end
end
