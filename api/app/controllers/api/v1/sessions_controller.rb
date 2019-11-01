# frozen_string_literal: true

# Controller for Sessions
class Api::V1::SessionsController < ApplicationController
    before_action :find_session, except: %i[index create]

    # GET /sessions
    def index
        render_success Session.order(:id)
    end

    # POST /sessions
    def create
        # if we passed in an id that exists, we want to update
        if params[:id].present? && find_session
            update
            return
        end

        session = Session.new(session_params)
        if session.save!
            render_success session
        else
            render_error session.errors.full_messages.join('; ')
        end
    end

    def update
        if @session.update_attributes!(session_params)
            render_success @session
        else
            render_error @session.errors.full_messages.join('; ')
        end
    end

    # POST /sessions/delete
    def delete
        if @session.destroy!
            render_success @session
        else
            render_error @session.errors.full_messages.join('; ')
        end
    end

    private

    def find_session
        @session = Session.find_by(id: params[:id])
    end

    def session_params
        params.permit(
            :id,
            :name,
            :rate1,
            :rate2,
            :start_date,
            :end_date
        )
    end
end
