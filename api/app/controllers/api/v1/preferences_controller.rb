# frozen_string_literal: true

module Api::V1
    # Controller for Preferences
    class PreferencesController < ApplicationController

        # POST /add_preference
        def create
            if not Application.exists?(id: params[:application_id])
                render json: { status: 'error', message: 'Invalid application_id', payload: {} }
                return
            end
            if not Position.exists?(id: params[:position_id])
                render json: { status: 'error', message: 'Invalid position_id', payload: {} }
                return
            end
            preference = PositionPreference.new(preference_params)
            if preference.save # passes PositionPreference model validation
                render json: { status: 'success', 
                    message: '', payload: preferences_by_application }
            else
                render json: { status: 'error', 
                    message: preference.errors, 
                    payload: preferences_by_application }
            end
        end
 
        private
        def preference_params
            params.permit(
                :application_id,
                :position_id,
                :preference_level,
            )
        end

        def preferences_by_application
            return PositionPreference.order(:id).select do |entry|
                entry[:application_id] == params[:application_id].to_i
            end
        end

    end
  end
  