# frozen_string_literal: true

module Api::V1
    # Controller for PositionTemplates
    class PositionTemplatesController < ApplicationController

        # GET /position_templates
        def index
            render json: { status: 'success', message: '', payload: PositionTemplate.order(:id) }
        end

        # POST /position_templates
        def create
            if params.include?(:offer_template)
                position_template = PositionTemplate.new(position_template_params)
                if position_template.save
                    index
                else
                    render json: { status: 'error', message: position_template.errors, payload: PositionTemplate.order(:id) }
                end
            else
                render json: { status: 'error', message: 'No offer_template given', payload: PositionTemplate.order(:id) }
            end
        end

        # GET /available_position_templates
        def available
            files = Dir.glob("#{Rails.root}/app/views/position_templates/*")
            render json: { status: 'success', message: '', payload: files }
        end

        private
        def position_template_params
            params.permit(
                :id,
                :session_id,
                :offer_template,
                :position_type,
            )
        end
    end
end