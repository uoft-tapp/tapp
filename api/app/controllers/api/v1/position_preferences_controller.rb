# frozen_string_literal: true

module Api::V1
    # Controller for PositionPreferences
    class PositionPreferencesController < ApplicationController
        # GET /position_preferences
        def index
            render_success(PositionPreference.order(:id))
        end

        # POST /add_preference
        def create
            # if we passed in an id that exists, we want to update
            update && return if should_update(PositionPreference, params)
            return if invalid_id_check(Application)

            params.require(:position_id)
            return if invalid_id_check(Position, preferences_by_application)

            output = proc { preferences_by_application }
            create_entry(PositionPreference, preference_params, output: output)
        end

        def update
            entry = PositionPreference.find(params[:id])
            update_entry(entry, preference_update_params)
        end

        # POST /position_preferences/delete
        def delete
            delete_entry(PositionPreference, params)
        end

        private

        def preference_params
            params.permit(
                :application_id,
                :position_id,
                :preference_level
            )
        end

        def preference_update_params
            params.permit(
                :preference_level
            )
        end

        def preferences_by_application
            filter_given_id(PositionPreference, :application_id)
        end
    end
end
