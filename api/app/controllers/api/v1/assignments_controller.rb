# frozen_string_literal: true

module Api::V1
    # Controller for Assignments
    class AssignmentsController < ApplicationController

        # GET /assignments
        def index
            if not params.include?(:position_id)
                render json: { status: 'success', message: '', payload: Assignment.order(:id) }
                return
            end
            if Position.exists?(id: params[:position_id])
                render json: { status: 'success', message: '', payload: assignments_by_position }
            else
                render json: { status: 'error', message: 'Invalid position_id', payload: {} }
            end
        end

        # POST /assignments
        def create
            params.require(:applicant_id)
            if not Position.exists?(id: params[:position_id])
                render json: { status: 'error', message: 'Invalid position_id', payload: {} }
                return
            end
            if not Applicant.exists?(id: params[:applicant_id])
                render json: { status: 'error', message: 'Invalid applicant_id', payload: {} }
                return
            end
            assignment = Assignment.new(assignment_params)
            if assignment.save
                render json: { status: 'success', message: '', payload: assignment }
            else
                render json: { status: 'error', message: assignment.errors, payload: {} }
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
