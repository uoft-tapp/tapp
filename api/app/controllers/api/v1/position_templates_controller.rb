# frozen_string_literal: true

module Api::V1
    # Controller for PositionTemplates
    class PositionTemplatesController < ApplicationController

        # GET /position_templates
        def index
            render_success(position_templates_by_session)
        end

        # POST /add_position_template
        def create
            params.require(:offer_template)
            if invalid_id(Session, :session_id, []) then return end
            position_template = PositionTemplate.new(position_template_params)
            if position_template.save  # passes PostionTemplate model validataion
                index
            else
                render_error(position_template.errors, position_templates_by_session)
            end
        end

        # GET /available_position_templates
        def available
            files = Dir.glob("#{Rails.root}/app/views/position_templates/*")
            render_success(files)
        end

        private
        def position_template_params
            params.permit(
                :session_id,
                :offer_template,
                :position_type,
            )
        end

        def position_templates_by_session
            return PositionTemplate.order(:id).select do |entry|
                entry[:session_id] == params[:session_id].to_i
            end
        end
    end
end