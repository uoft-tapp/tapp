# frozen_string_literal: true

# Controller for ContractTemplates
class Api::V1::Instructor::ContractTemplatesController < ApplicationController
    # GET /contract_templates
    def index
        render_success ContractTemplate.by_session(params[:session_id])
    end
end
