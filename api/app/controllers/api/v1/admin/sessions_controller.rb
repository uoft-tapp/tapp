# frozen_string_literal: true

class Api::V1::Admin::SessionsController < ApplicationController
    # GET /sessions
    def index
        render_success Session.order(:id)
    end

    # POST /sessions
    def create
        @session = Session.find_by(id: params[:id])
        update and return if @session
        @session = Session.new(session_params)
        render_on_condition(object: @session, condition: proc { @session.save! })
    end

    # POST /sessions/delete
    def delete
        @session = Session.find(params[:id])
        render_on_condition(object: @session, condition: proc { @session.destroy! })
    end

    private

    def session_params
        params.permit(:id, :name, :rate1, :rate2, :start_date, :end_date)
    end

    def update
        render_on_condition(object: @session,
                            condition: proc { @session.update!(session_params) })
    end
end
