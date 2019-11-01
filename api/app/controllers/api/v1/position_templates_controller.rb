# frozen_string_literal: true

# Controller for PositionTemplates
class Api::V1::PositionTemplatesController < ApplicationController
    before_action :find_position_template, only: %i[delete]

    # GET /position_templates
    def index
        if params[:session_id].blank?
            render_success PositionTemplate.order(:id)
            return
        end
        return if invalid_id?(Session, :session_id)

        render_success position_templates_by_session
    end

    # POST /add_position_template
    def create
        # if we passed in an id that exists, we want to update
        if params[:id].present? && @position_template.present?
            update
            return
        end

        return if invalid_id?(Session, :session_id, [])

        position_template = PositionTemplate.new(position_template_params)
        if position_template.save
            index
        else
            render_error(position_template.errors, position_templates_by_session)
        end
    end

    # GET /available_position_templates
    def available
        dir = "#{Rails.root}/app/views/position_templates/"
        files = Dir.glob("#{dir}/#{ENV['DEPARTMENT']}/*").map do |entry|
            {
                offer_template: entry.sub(dir, '')
            }
        end
        render_success files
    end

    # POST /position_templates/delete
    def delete
        if @position_template.destroy!
            render_success @position_template
        else
            render_error @position_template.errors.full_messages.join('; ')
        end
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
        PositionTemplate.by_session(params[:session_id])
    end

    def find_position_template
        @position_template = PostionTemplate.find(params[:id])
    end

    def update
        if @position_template.update_attributes!(position_template_update_params)
            render_success(@position_template)
        else
            render_error(@position_template.errors)
        end
    end
end
