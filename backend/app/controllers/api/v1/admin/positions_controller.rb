# frozen_string_literal: true

class Api::V1::Admin::PositionsController < ApplicationController
    before_action :store_params, :find_position

    # POST /positions
    def create
        upsert
    end

    # POST /positions/delete
    def delete
        render_on_condition(
            object: @position, condition: proc { @position.destroy! }
        )
    end

    private

    # This method may be manually called from other controllers. Because
    # of that, it doesn't render, instead leaving rendering up to the caller
    def upsert
        # update the position if we have one
        if @position
            start_transaction_and_rollback_on_exception do
                service = PositionService.new(position: @position)
                service.update(params: position_params)
            end
            # create a new position if one doesn't currently exist
        else
            start_transaction_and_rollback_on_exception do
                service =
                    PositionService.new(params: position_params.except(:id))
                service.perform
                @position = service.position
            end
        end

        render_success @position
    end

    def find_position
        @position = Position.find(params[:id])
    end

    def store_params
        @params = params
    end

    def position_params
        @params.permit(
            :id,
            :position_code,
            :position_title,
            :hours_per_assignment,
            :start_date,
            :end_date,
            :session_id,
            :contract_template_id,
            :desired_num_assignments,
            :current_enrollment,
            :current_waitlisted,
            :duties,
            :qualifications,
            instructor_ids: []
        )
    end
end
