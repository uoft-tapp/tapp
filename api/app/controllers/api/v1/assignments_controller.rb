# frozen_string_literal: true

# Controller for Assignments
class Api::V1::AssignmentsController < ApplicationController
    before_action :find_assignment, except: :index

    # GET /assignments
    def index
        if params[:position_id].blank?
            render_success Assignment.order(:id)
            return
        end
        return if invalid_id?(Position, :position_id)

        render_success Assignment.by_position(params[:position_id])
    end

    # POST /assignments
    def create
        # if we passed in an id that exists, we want to update
        if params[:id].present? && @assignment.present?
            update
            return
        end

        return if invalid_id?(Position, :position_id) || invalid_id?(Applicant, :applicant_id)

        ActiveRecord::Base.transaction do
            assignment = Assignment.create!(assignment_params)
            wage_chunk = assignment.wage_chunks.create!(hours: params[:hours])
            render_success assignment
        rescue StandardError
            if assignment.errors?
                render_error assignment.errors
            elsif wage_chunk.errors?
                render_error wage_chunk.errors
            end
            raise ActiveRecord::Rollback
        end
    end

    # POST /assignments/delete
    def delete
        if @assignment.destroy!
            render_success @assignment
        else
            render_error @assignment.errors.full_messages.join('; ')
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

    def find_assignment
        @assignment = Assignment.find(params[:id])
    end

    def update
        if assignment.update_attributes!(assignment_update_params)
            render_success(assignment)
        else
            render_error(assignment.errors)
        end
    end
end
