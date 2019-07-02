# frozen_string_literal: true

module Api::V1
    # Controller for Preferences
    class PreferencesController < ApplicationController

        # POST /add_preference
        def create
            params.require(:position_id)
            if invalid_primary_key(Application, :application_id, [])
                return
            end
            if invalid_primary_key(Position, :position_id, preferences_by_application)
                return
            end
            preference = PositionPreference.new(preference_params)
            if preference.save # passes PositionPreference model validation
                render_success(preferences_by_application)
            else
                render_error(preference.errors, preferences_by_application)
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
  