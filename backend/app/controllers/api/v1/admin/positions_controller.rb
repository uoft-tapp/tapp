# frozen_string_literal: true

class Api::V1::Admin::PositionsController < ApplicationController
    before_action :find_position, :store_params

    # POST /positions
    def create
        render_success upsert(params: @params, position: @position)
    end

    # POST /positions/delete
    def delete
        render_on_condition(object: @position, condition: proc { @position.destroy! })
    end

    # This method may be manually called from other controllers. Because
    # of that, it doesn't render, instead leaving rendering up to the caller
    def upsert(params:, position: nil)
        @params = params
        @position = position

        # update the position if we have one
        if @position
            start_transaction_and_rollback_on_exception do
                service = @position.as_position_service
                service.update(params: position_params)
                return @position
            end
        end

        # create a new position if one doesn't currently exist
        start_transaction_and_rollback_on_exception do
            service = PositionService.new(params: position_params)
            service.perform
            @position = service.position
        end
    end

    private

    def find_position
        @position = Position.find(params[:id])
    end

    def store_params
        @params = params
    end

    def position_params
        @params.permit(:id, :position_code, :position_title, :hours_per_assignment,
                       :start_date, :end_date, :session_id, :contract_template_id,
                       :desired_num_assignments, :current_enrollment, :current_waitlisted,
                       :duties, :qualifications, :ad_hours_per_assignment, :ad_num_assignments,
                       :ad_open_date, :ad_close_date,
                       instructor_ids: [])
    end
end
