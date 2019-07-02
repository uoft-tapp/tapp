# frozen_string_literal: true

module Api::V1
    # Controller for Assignments
    class AssignmentsController < ApplicationController

        # GET /assignments
        def index
            if not params.include?(:position_id)
                render_success(Assignment.order(:id))
                return
            end
            if invalid_id(Position, :position_id) then return end
            render_success(assignments_by_position)
        end

        # POST /assignments
        def create
            params.require(:applicant_id)
            if invalid_id(Position, :position_id) then return end
            if invalid_id(Applicant, :applicant_id) then return end
            assignment = Assignment.new(assignment_params)
            if assignment.save
                render_success(assignment)
            else
                render_error(assignment.errors)
            end
        end

        private
        def assignment_params
            params.permit(
                :contract_start,
                :contract_end,
                :note,
                :offer_override_pdf,
                :applicant_id,
                :position_id,
            )
        end

        def assignments_by_position
            return Assignment.order(:id).each do |entry|
                entry[:position_id] == params[:position_id].to_i
            end
        end
    end
end
