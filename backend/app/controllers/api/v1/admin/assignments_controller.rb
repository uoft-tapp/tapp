# frozen_string_literal: true

class Api::V1::Admin::AssignmentsController < ApplicationController
    # GET /sessions/:session_id/assignments
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
        @assignment = Assignment.find_by(id: params[:id])
        update && return if @assignment
        @assignment = Assignment.new(assignment_params)
        render_on_condition(
            object: @assignment, condition: proc { @assignment.save! }
        )
    end

    private

    def assignment_params
        params.permit(
            :applicant_id,
            :position_id,
            :start_date,
            :end_date,
            :note,
            :contract_override_pdf,
            :hours
        )
    end

    def update
        render_on_condition(
            object: @assignment,
            condition: proc { @assignment.update!(assignment_params) }
        )
    end
end
