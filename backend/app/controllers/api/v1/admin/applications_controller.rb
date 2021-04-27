# frozen_string_literal: true

# Controller for Applications
class Api::V1::Admin::ApplicationsController < ApplicationController
    include TransactionHandler

    # GET /applications
    def index
        render_success Application.by_session(params[:session_id])
    end

    # POST /applications
    def create
        @application = Application.find_by(id: params[:id])
        puts @application.inspect
        update && return if @application.present?

        start_transaction_and_rollback_on_exception do
            @application = Application.create!(application_params)
            render_success @application
        end
    end

    private

    def application_params
        params.permit(
            :comments,
            :session_id,
            :program,
            :department,
            :previous_uoft_experience,
            :yip,
            :annotation,
            :gpa,
            :first_time_ta,
            :custom_question_answers
        )
    end

    def update
        start_transaction_and_rollback_on_exception do
            @application.update!(application_params)
            render_success @application
        end
    end
end
