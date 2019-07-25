# frozen_string_literal: true

module Api::V1
    # Controller for PositionTemplates
    class PositionTemplatesController < ApplicationController

        # GET /position_templates
        def index
            if not params.include?(:session_id)
                render_success(PositionTemplate.order(:id))
                return
            end
            if invalid_id(Session, :session_id) then return end
            render_success(position_templates_by_session)
        end

        # POST /add_position_template and /position_templates
        def create
            params.require(:offer_template)
            if invalid_id(Session, :session_id, []) then return end
            position_template = PositionTemplate.new(position_template_params)
            if position_template.save  # passes PostionTemplate model validataion
                index
            else
                position_template.destroy!
                render_error(position_template.errors, position_templates_by_session)
            end
        end

        # GET /available_position_templates
        def available
            files = Dir.glob("#{Rails.root}/app/views/position_templates/*")
            render_success(files)
        end

        # POST /position_templates/:id
        def update
            position_template = PositionTemplate.find(params[:id])
            if position_template.update_attributes!(position_template_update_params)
                render_success(position_template)
            else
                render_error(position_template.errors)
            end
        end

        # /position_templates/delete or /position_templates/:id/delete
        def delete
            params.require(:id)
            position_template = PostionTemplate.find(params[:id])
            if position_template.destroy!
                render_success(position_template)
            else
                render_error(position_template.errors.full_messages.join("; "))
            end
        end

        private
        def position_template_params
            params.permit(
                :session_id,
                :offer_template,
                :position_type,
            )
        end

        def position_template_update_params
            params.permit(
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