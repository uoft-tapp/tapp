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
            # if we passed in an id that exists, we want to update the session
            if params[:id] && Session.exists?(params[:id])
                update and return
            end

            # when creating a new session, a name is required
            params.require(:name)
            session = Session.new(session_params)
            if session.save # passes Session model validation
                render_success(session)
            else
                session.destroy!
                render_error(session.errors.full_messages.join("; "))
            end
        end

        # POST /sessions/:id
        def update
            session = Session.find(params[:id])
            if session.update_attributes!(session_params)
                render_success(session)
            else
                render_error(session.errors.full_messages.join("; "))
            end
        end

        # /sessions/delete or /sessions/:id/delete
        def delete
            params.require(:id)
            session = Session.find(params[:id])
            if session.destroy!
                render_success(session)
            else
                render_error(session.errors.full_messages.join("; "))
            end
        end

        private
        def session_params
            params.permit(
                :id,
                :name,
                :rate1,
                :rate2,
                :start_date,
                :end_date,
            )
        end
    end
end
