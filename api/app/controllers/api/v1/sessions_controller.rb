# frozen_string_literal: true

module Api::V1
    # Controller for Sessions
    class SessionsController < ApplicationController

        # GET /sessions
        def index
            render_success(Session.order(:id))
        end

        # POST /sessions
        def create
            params.require(:name)
            session = Session.new(session_params)
            if session.save # passes Session model validation
                render_success(session)
            else
                render_error(session.errors)
            end
        end

        private
        def session_params
            params.permit(
                :name,
                :rate1,
                :rate2,
                :start_date,
                :end_date,
            )
        end
    end
end