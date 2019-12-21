# frozen_string_literal: true

# Controller for ContractTemplates
class Api::V1::Admin::ContractTemplatesController < ApplicationController
    # GET /contract_templates
    def index
        render_success ContractTemplate.by_session(params[:id])
    end

    # POST /contract_templates
    def create
        @session = Session.find(params[:id])
        @session.contract_template.new(contract_template_create_params)
        render_on_condition(object: @session, condition: proc { @session.save! })
    end

    # GET /available_contract_templates
    def available
        dir = "#{Rails.root}/app/views/contract_templates/"
        files = Dir.glob("#{dir}/#{ENV['DEPARTMENT']}/*").map do |entry|
            {
                template_file: entry.sub(dir, '')
            }
        end
        render_success files
    end

    private

    def contract_template_create_params
        params.permit(:template_file, :template_name)
    end
end
