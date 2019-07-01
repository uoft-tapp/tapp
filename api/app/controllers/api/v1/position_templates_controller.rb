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
            if not Session.exists?(id: params[:session_id])
                render json: { status: 'error', 
                    message: 'Invalid session_id', payload: position_templates_by_session }
                return
            end
            if not params.require(:offer_template)
                render json: { status: 'error', 
                    message: 'No offer_template given', payload: position_templates_by_session }
                return
            end
            position_template = PositionTemplate.new(position_template_params)
            if position_template.save  # passes PostionTemplate model validataion
                index
            else
                render json: { status: 'error', 
                    message: position_template.errors, payload: position_templates_by_session }
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
            return PositionTemplate.order(:id).select do |entry|
                entry[:session_id] == params[:session_id].to_i
            end
        end
    end
end