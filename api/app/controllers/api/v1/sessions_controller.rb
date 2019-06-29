# frozen_string_literal: true

module Api::V1
    # Controller for Sessions
    class SessionsController < ApplicationController

        # GET /sessions
        def index
            render json: { status: 'success', message: '', payload: Session.order(:id) }
        end

        # POST /sessions
        def create
            if not params.include?(:name)
                render json: { status: 'error', message: 'No name given', payload: {} }
                return
            end
            session = Session.new(session_params)
            if session.save
                render json: { status: 'success', message: '', payload: session }
            else
                render json: { status: 'error', message: session.errors, payload: {} }
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