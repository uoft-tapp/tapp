# frozen_string_literal: true

module Api::V1
    # Controller for PositionTemplates
    class PositionTemplatesController < ApplicationController

        # GET /position_templates
        def index
            render json: { status: 'success', message: '', payload: position_templates_by_session }
        end

        # POST /add_position_template
        def create
            if Session.exists?(id: params[:session_id])
                if params.include?(:offer_template)
                    position_template = PositionTemplate.new(position_template_params)
                    if position_template.save
                        index
                    else
                        render json: { status: 'error', message: position_template.errors, payload: position_templates_by_session }
                    end
                else
                    render json: { status: 'error', message: 'No offer_template given', payload: position_templates_by_session }
                end
            else
                render json: { status: 'error', message: 'Invalid session_id', payload: position_templates_by_session }
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

        def position_templates_by_session
            position_templates = []
            PositionTemplate.order(:id).each do |entry|
                if entry[:session_id] == params[:session_id].to_i
                    position_templates.push(entry)
                end
            end
            return position_templates
        end
    end
end