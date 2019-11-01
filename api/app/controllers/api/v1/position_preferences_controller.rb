# frozen_string_literal: true

# Controller for PositionPreferences
class PositionPreferencesController < ApplicationController
    before_action :find_position_preference, except: :index

    # GET /position_preferences
    # FIXME: This should be scoped?
    def index
        render_success PositionPreference.order(:id)
    end

    # POST /add_preference
    def create
        # if we passed in an id that exists, we want to update
        if params.key?(:id) && @position_preference.present?
            update
            return
        end

        return if invalid_id?(Application, :application_id, []) ||
                  invalid_id?(Position, :position_id, preferences_by_application)

        preference = PositionPreference.new(preference_params)
        if preference.save!
            render_success preferences_by_application
        else
            render_error(preference.errors, preferences_by_application)
        end
    end

    # POST /position_preferences/delete
    def delete
        if @position_preference.destroy!
            render_success @position_preference
        else
            render_error @position_preference.errors.full_messages.join('; ')
        end
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

    def position_preference
        @position_preference = PositionPreference.by_application(params[:application_id])
    end

    def update
        if @position_preference.update_attributes!(preference_update_params)
            render_success(@position_preference)
        else
            render_error(@position_preference.errors)
        end
    end
end
