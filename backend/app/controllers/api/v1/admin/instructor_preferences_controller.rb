# frozen_string_literal: true

class Api::V1::Admin::InstructorPreferencesController < ApplicationController
    # GET /sessions/:session_id/instructor_preferences
    def index
        render_success InstructorPreference.by_session(params[:session_id])
    end
end
