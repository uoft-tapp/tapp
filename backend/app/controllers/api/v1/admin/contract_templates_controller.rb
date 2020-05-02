# frozen_string_literal: true

# Controller for ContractTemplates
class Api::V1::Admin::ContractTemplatesController < ApplicationController
    # GET /contract_templates
    def index
        render_success ContractTemplate.by_session(params[:session_id])
    end

    # POST /contract_templates
    def create
        @contract_template = ContractTemplate.find_by(id: params[:id])
        update && return if @contract_template
        # if we aren't updating, we need to create a contract_template
        # for the specified session.
        @session = Session.find(params[:session_id])
        template = @session.contract_templates.new(contract_template_params)
        render_on_condition(
            object: template, condition: proc { template.save! }
        )
    end

    # GET /available_contract_templates
    def available
        contract_dir = Rails.application.config.contract_template_dir
        files =
            Dir.glob("#{contract_dir}/*.html").map do |entry|
                { template_file: entry.sub(contract_dir, '') }
            end
        render_success files
    end

    private

    def contract_template_params
        params.permit(:template_file, :template_name, :session_id, :id)
    end

    def update
        render_on_condition(
            object: @contract_template,
            condition:
                proc { @contract_template.update!(contract_template_params) }
        )
    end
end
