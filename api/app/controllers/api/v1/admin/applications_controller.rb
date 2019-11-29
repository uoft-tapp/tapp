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
        @application = Application.find_by(id: params[:application_id])
        update and return if @application.present?
        start_transaction_and_rollback_on_exception do
            application = Application.create!(application_params)
            application.create_applicant_data_for_matching!(
                applicant_data_for_matching_params
            )
            render_success application.as_json
        end
    end

    private

    def application_params
        params.permit(:comments, :session_id)
    end

    def applicant_data_for_matching_params
        params.permit(:program, :department, :previous_uoft_experience, :yip,
                      :annotation, :applicant_id)
    end

    def update
        start_transaction_and_rollback_on_exception do
            @application.update!(application_update_params)
            @application.applicant_data_for_matching
                        .update!(applicant_data_for_matching_params)
            render_success application.as_json
        end
    end
end
