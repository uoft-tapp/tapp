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
            return if invalid_id(Session, :session_id)
            render_success(position_templates_by_session)
        end

        # POST /add_position_template
        def create
            # if we passed in an id that exists, we want to update
            if params[:id] && PositionTemplate.exists?(params[:id])
                update and return
            end
            params.require(:offer_template)
            return if invalid_id(Session, :session_id, [])
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

        def update
            position_template = PositionTemplate.find(params[:id])
            if position_template.update_attributes!(position_template_update_params)
                render_success(position_template)
            else
                render_error(position_template.errors)
            end
        end

        # POST /position_templates/delete
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