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
            assignment_save = assignment.save
            wage_chunk_save = true
            errors = assignment.errors
            if params.include?(:hours)
                wage_chunk = assignment.wage_chunks.new(hours: params[:hours])
                wage_chunk_save = wage_chunk.save
                errors = assignment.errors.messages.deep_merge(wage_chunk.errors.messages)
            end
            if assignment_save and wage_chunk_save
                render_success(assignment)
            else
                render_error(errors)
            end
        end

        # PUT/PATCH /assignments/:id
        def update
            assignment = Assignment.find(params[:id])
            if assignment.update_attributes!(assignment_update_params)
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

        def assignment_update_params
            params.permit(
                :contract_start,
                :contract_end,
                :note,
                :offer_override_pdf,
            )
        end

        def assignments_by_position
            return Assignment.order(:id).each do |entry|
                entry[:position_id] == params[:position_id].to_i
            end
        end
    end
end
