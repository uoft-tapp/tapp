# frozen_string_literal: true

class Api::V1::Admin::InstructorPreferencesController < ApplicationController
    # GET /sessions/:session_id/instructor_preferences
    def index
        render_success InstructorPreference.by_session(params[:session_id])
    end

    # GET /assignments/:assignment_id
    def show
        @instructor_preference = InstructorPreference.find(params[:id])
        render_success @instructor_preference
    end

    # POST /assignments
    def create
        @instructor_preference = InstructorPreference.find_by(id: params[:id])
        update && return if @instructor_preference

        @instructor_preference =
            InstructorPreference.new(instructor_preference_params)
        render_on_condition(
            object: @instructor_preference,
            condition: proc { @instructor_preference.save! }
        )
    end

    private

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
