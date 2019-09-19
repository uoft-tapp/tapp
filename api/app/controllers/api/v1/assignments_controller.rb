# frozen_string_literal: true

module Api::V1
    # Controller for Assignments
    class AssignmentsController < ApplicationController
        # GET /assignments
        def index
            index_response(Assignment, Position, assignments_by_position)
        end

        # POST /assignments
        def create
            # if we passed in an id that exists, we want to update
            update && return if should_update(Assignment, params)
            params.require(:applicant_id)
            return if invalid_id(Position, :position_id)
            return if invalid_id(Applicant, :applicant_id)

            create_subparts = proc do |assignment|
                message = valid_wage_chunk(assignment, assignment.errors.messages)
                if !message
                    render_success(assignment)
                else
                    assignment.destroy!
                    render_error(message)
                end
            end
            create_entry(Assignment, assignment_params, after_fn: create_subparts)
        end

        def update
            entry = Assignment.find(params[:id])
            update_entry(entry, assignment_update_params)
        end

        # POST /assignments/delete
        def delete
            delete_entry(Assignment, params)
        end

        private

        def assignment_params
            params.permit(
                :contract_start,
                :contract_end,
                :note,
                :offer_override_pdf,
                :applicant_id,
                :position_id
            )
        end

        def assignment_update_params
            params.permit(
                :contract_start,
                :contract_end,
                :note,
                :offer_override_pdf
            )
        end

        def assignments_by_position
            filter_given_id(Assignment, :position_id)
        end

        def valid_wage_chunk(assignment, errors)
            if params.include?(:hours)
                wage_chunk = assignment.wage_chunks.new(hours: params[:hours])
                if wage_chunk.save
                    return nil
                else
                    wage_chunk.destroy!
                    return errors.deep_merge(wage_chunk.errors.messages)
                end
            else
                errors
            end
        end
    end
end
