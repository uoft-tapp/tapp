# frozen_string_literal: true

module Api::V1
    # Controller for Positions
    class PositionsController < ApplicationController

        # GET /positions
        def index
            render json: { status: 'success', message: '', payload: positions_by_session }
        end

        # POST /positions
        def create
            req_keys = [:position_code, :position_title]
            if Session.exists?(id: params[:session_id])
                if req_keys & params.keys.map(&:to_sym) == req_keys
                    position = Position.new(position_params)
                    if position.save
                        params[:position_id] = position[:id]
                        PositionDataForAd.new(position_data_for_ad_params)
                        PositionDataForMatching.new(position_data_for_matching_params)
                        render json: { status: 'success', message: '', payload: position }
                    else
                        render json: { status: 'error', message: position.errors, payload: {} }
                    end
                else
                    render json: { status: 'error', 
                        message: 'Missing position_code or position_title', payload: {} }
                end
            else
                render json: { status: 'error', message: 'Invalid session_id', payload: {} }
            end          
        end

        private
        # Only allow a trusted parameter "white position" through.
        def position_params
            params.permit(
                :id,
                :session_id,
                :position_code, 
                :position_title, 
                :est_hours_per_assignment, 
                :est_start_date, 
                :est_end_date, 
                :position_type, 
            )
        end

        def position_data_for_ad_params
            params.permit(
                :id,
                :position_id,
                :duties, 
                :qualifications, 
                :ad_hours_per_assignment, 
                :ad_num_assignments, 
                :ad_open_date, 
                :ad_close_date, 
            )
        end

        def position_data_for_matching_params
            params.permit(
                :id,
                :position_id,
                :desired_num_assignments, 
                :current_enrollment, 
                :current_waitlisted
            )
        end

        def positions_by_session
            return Position.order(:id).select do |entry|
                entry[:session_id] == params[:session_id].to_i
            end
        end
    end
end
