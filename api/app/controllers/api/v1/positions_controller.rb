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
            params.require([:position_code, :position_title])
            if not Session.exists?(id: params[:session_id])
                render json: { status: 'error', message: 'Invalid session_id', payload: {} }
                return
            end
            position = Position.new(position_params)
            if not position.save # does not pass Position model validation
                render json: { status: 'error', message: position.errors, payload: {} }
            end
            params[:position_id] = position[:id]
            message = valid_ad_and_matching
            if not message
                render json: { status: 'success', message: '', payload: position }
            else
                render json: { status: 'success', message: message, payload: {} }
            end
        end

        private
        # Only allow a trusted parameter "white position" through.
        def position_params
            params.permit(
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

        def valid_ad_and_matching
            ad = PositionDataForAd.new(position_data_for_ad_params)
            matching = PositionDataForMatching.new(position_data_for_matching_params)
            ad_save = ad.save
            matching_save = matching_save
            if ad_save and matching_save
                return nil
            elsif ad_save and not matching_save
                return matching.errors
            elsif not ad_save and matching_save
                return ad.errors
            else
                return ad.errors.messages.deep_merge(matching.errors.messages)
            end                
        end
    end
end
