# frozen_string_literal: true

module Api::V1
    # Controller for PositionTemplates
    class PositionTemplatesController < ApplicationController
        # GET /position_templates
        def index
            index_response(PositionTemplate, Session, position_templates_by_session)
        end

        # POST /add_position_template
        def create
            # if we passed in an id that exists, we want to update
            update && return if should_update(PositionTemplate, params)
            return if invalid_id_check(Session)

            params.require(%i[offer_template position_type])
            output = proc { position_templates_by_session }
            create_entry(PositionTemplate, position_template_params, output: output)
        end

        # GET /available_position_templates
        def available
            dir = "#{Rails.root}/app/views/position_templates/"
            files = Dir.glob("#{dir}/#{ENV['DEPARTMENT']}/*").map do |entry|
                {
                    offer_template: entry.sub(dir, '')
                }
            end
            render_success(files)
        end

        def update
            entry = PositionTemplate.find(params[:id])
            update_entry(entry, position_template_update_params)
        end

        # POST /position_templates/delete
        def delete
            delete_entry(PositionTemplate, params)
        end

        private

        def position_template_params
            params.permit(
                :session_id,
                :offer_template,
                :position_type
            )
        end

        def position_template_update_params
            params.permit(
                :offer_template,
                :position_type
            )
        end

        def position_templates_by_session
            filter_given_id(PositionTemplate.order(:id), :session_id)
        end
    end
end
