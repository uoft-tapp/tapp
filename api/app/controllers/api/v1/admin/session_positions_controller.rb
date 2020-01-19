# frozen_string_literal: true

class Api::V1::Admin::SessionPositionsController < ApplicationController
    before_action :find_session

    # GET /positions
    def index
        render_success @session.positions
    end

    # POST /positions
    def create
        @position = @session.positions.find_by(params[:id])
        update && return if @position
        @position = @session.positions.new(position_find_or_create_params)
        render_on_condition(object: @position,
                            condition: proc { @position.save! })
    end

    private

    def find_session
        @session = Session.find(params[:session_id])
    end

    def position_find_or_create_params
        params.permit(:id, :position_code, :position_title, :hours_per_assignment,
                      :start_date, :end_date, :duties, :qualifications,
                      :ad_hours_per_assignment, :ad_num_assignments,
                      :ad_open_date, :ad_close_date, :desired_num_assignments,
                      :current_enrollment, :current_waitlisted, :instructor_ids)
    end

    def update
        render_on_condition(object: @position,
                            condition: proc {
                                @position.update!(position_find_or_create_params)
                            })
    end
end
