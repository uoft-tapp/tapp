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

    # GET /contract_templates/:id/view
    def view
        ensure_contract_template
        # load the offer as a Liquid template
        template = Liquid::Template.parse(template_html)

        render_success template.render(sample_template_variables)
    end

    # GET /contract_templates/:id/download
    def download
        ensure_contract_template

        # Because JSON encoding can mess with file contents, we
        # encode everything as base64 before sending.
        render_success(
            file_name: @contract_template.template_file,
            mime_type: 'text/html',
            content: Base64.strict_encode64(template_html)
        )
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

    def template_file_full_path
        contract_dir = Rails.application.config.contract_template_dir
        template_file = "#{contract_dir}/#{@contract_template.template_file}"
        # Verify that the template file is actually contained in the template directory
        unless Pathname.new(template_file).realdirpath.to_s.starts_with?(
                   contract_dir
               )
            raise StandardError, "Invalid contract path #{template_file}"
        end

        template_file
    end

    def template_html
        File.read(template_file_full_path)
    end

    # Lookup the contract template specified in params and
    # throw an error if it doesn't exist
    def ensure_contract_template
        @contract_template = ContractTemplate.find_by(id: params[:id])
        unless @contract_template
            raise StandardError, "No template found with id '#{params[:id]}'."
        end
    end

    # When rendering a template, any undefined variable are rendered as blank.
    # This makes it hard to visualize what a template will actually look like.
    # This function provides reasonable substitutions for the template variables
    # so they will show up in a preview.
    def sample_template_variables
        # font.css and header.css contain base64-encoded data since we need all
        # data to be embedded in the HTML document
        contract_dir = Rails.application.config.contract_template_dir
        styles = {
            'style_font' => File.read("#{contract_dir}/font.css"),
            'style_header' => File.read("#{contract_dir}/header.css")
        }

        {
            first_name: 'John',
            last_name: 'Doe',
            email: 'doej@utoronto.ca',
            position_code: 'MAT123',
            position_title: 'Deep Math',
            start_date: 'January 1, 2020',
            end_date: 'April 1, 2020',
            first_time_ta: false,
            instructor_contact_desc: 'Professor X <x@utoronto.ca>',
            pay_period_desc: '$54.25 from Januar 1, 2020 to April 1, 2020',
            hours: '50',
            installments: '4',
            signature: '',
            accepted_date: nil,
            withdrawn_date: nil,
            rejected_date: nil,
            status: 'pending'
        }.stringify_keys.merge(styles)
    end
end
