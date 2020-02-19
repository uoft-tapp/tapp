# frozen_string_literal: true

class Api::V1::Admin::AssignmentsController < ApplicationController
    # GET /contract_templates
    def index
        render_success Assignment.by_session(params[:session_id])
    end

    # GET /assignments/:assignment_id
    def show
        @assignment = Assignment.find(params[:id])
        render_success @assignment
    end

    # POST /assignments
    def create
        @assignment = Assignment.find_by(id: params[:assignment_id])
        update && return if @assignment
        @assignment = Assignment.new(assignment_params)
        render_on_condition(object: @assignment,
                            condition: proc { @assignment.save! })
    end

    private

    def assignment_params
        params.permit(:applicant_id, :position_id, :start_date, :end_date,
                      :note, :offer_override_pdf, :active_offer_status)
    end
end
