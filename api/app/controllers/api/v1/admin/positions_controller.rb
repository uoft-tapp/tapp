# frozen_string_literal: true

class Api::V1::Admin::PositionsController < ApplicationController
    before_action :find_position

    # POST /positions
    def update
        render_on_condition(object: @position, condition: proc {
            @position.update!(position_update_params)
        })
    end

    # POST /positions/delete
    def delete
        render_success(object: @position, condition: proc { @position.destroy! })
    end

    private

    def find_position
        @position = Position.find(params[:id])
    end

    def position_update_params
        params.permit(:id, :position_code, :position_title, :hours_per_assignment,
                      :start_date, :end_date, :duties, :qualifications, 
                      :ad_hours_per_assignment, :ad_num_assignments, :ad_open_date,
                      :ad_close_date, :desired_num_assignments, :current_enrollment,
                      :current_waitlisted, :instructor_ids)
    end
end
