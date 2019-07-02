# frozen_string_literal: true

module Api::V1
    # Controller for PositionPreferences
    class PositionPreferencesController < ApplicationController

        # POST /add_preference
        def create
            params.require(:position_id)
            if invalid_id(Application, :application_id, []) then return end
            if invalid_id(Position, :position_id, preferences_by_application) then return end
            preference = PositionPreference.new(preference_params)
            if preference.save # passes PositionPreference model validation
                render_success(preferences_by_application)
            else
                render_error(preference.errors, preferences_by_application)
            end
        end
 
       # PUT/PATCH /position_preferences/:id
        def update
            position_preference = PositionPreference.find(params[:id])
            if position_preference.update_attributes!(preference_update_params)
                render_success(position_preference)
            else
                render_error(position_preference.errors)
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

        def preference_update_params
            params.permit(
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
  