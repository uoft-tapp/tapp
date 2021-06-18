# frozen_string_literal: true

class Api::V1::Admin::DdahsController < ApplicationController
    # GET /sessions/:session_id/ddahs
    def index
        render_success Ddah.by_session(params[:session_id])
    end

    # GET /session/:session_id/ddahs/accepted_list
    def accepted_list
        ddahs = Ddah.by_session(params[:session_id]) || []

        # for PDF and HTML rendering, we start by rendering the ddah as an html document
        rendered = get_signature_list_html(ddahs)
        file_name = 'ddah-acknowledgement-signature-list.html'
        mime_type = 'text/html'
        if !params[:format].blank? && params[:format].downcase == 'pdf'
            file_name = 'ddah-acknowledgement-signature-list.pdf'
            mime_type = 'application/pdf'
            rendered = WickedPdf.new.pdf_from_string(rendered)
        end

        render_success file_name: file_name,
                       mime_type: mime_type,
                       content: Base64.strict_encode64(rendered)
    end

    # GET /ddahs/:ddah_id
    def show
        find_ddah
        render_success @ddah
    end

    # GET /assignments/:id/ddah
    def show_by_assignment
        # Because we are being routed through `/assignments`, the param is :id
        # and not :assignment_id
        assignment = Assignment.find(params[:id])
        render_success assignment.ddah
    end

    # POST /assignments/:id/ddah
    def upsert_by_assignment
        # We'll mangle the `params` variable in place and fall back to the
        # usual `create` function
        # Because we are being routed through `/assignments`, the param is :id
        # and not :assignment_id
        params[:assignment_id] = params[:id]
        create
    end

    # POST /ddahs
    def create
        # look up the DDAH first by assignment ID, otherwise, create a new DDAH
        @ddah =
            if params[:assignment_id]
                Assignment.find_by(id: params[:assignment_id]).ddah ||
                    Ddah.new(ddah_params)
            else
                Ddah.find(params[:id])
            end

        # It is possible that `Ddah.find(...)` didn't find a DDAH, which means we passed
        # an invalid id field and we didn't pass an `assignment_id` field. We cannot continue
        # in this case.
        unless @ddah
            render_error(
                message: 'Cannot create a DDAH without an assignment_id'
            ) && return
        end

        # Since `update` referrs to `@ddah`, and we either have an existing or a new (unsaved)
        # `@ddah`, it is safe to just call `update` here.
        update
    end

    # POST /ddahs/:ddah_id/approve
    def approve
        find_ddah
        unless @ddah.approved_date
            @ddah.approve
            @ddah.save!
        end
        render_success @ddah
    end

    # POST /ddahs/:ddah_id/delete
    def delete
        find_ddah
        render_on_condition(
          object: @ddah,
          condition: proc { @ddah.destroy! },
          error_message:
            "Could not delete ddah '#{@ddah.id}'."
      )
    end

    # POST /ddahs/:ddah_id/email
    def email
        find_ddah

        DdahMailer.email_ddah(@ddah).deliver_now!

        unless @ddah.emailed_date
            @ddah.email
            @ddah.save!
        end
        render_success @ddah
    end

    private

    def find_ddah
        @ddah = Ddah.find(params[:id])
    end

    def ddah_params
        params.slice(
            :assignment_id,
        ).permit!
    end

    def update
        render_on_condition(
            object: @ddah,
            condition:
                proc do
                    service = DdahService.new(params: params, ddah: @ddah)
                    service.update!
                end
        )
    end

    def get_signature_list_html(ddahs)
        contract_dir = Rails.root.join('app/views/ddahs/')
        template_file = "#{contract_dir}/ddah-signature-list.html"

        # Verify that the template file is actually contained in the template directory
        unless Pathname
                   .new(template_file)
                   .realdirpath
                   .to_s
                   .starts_with?(contract_dir.to_s)
            raise StandardError, "Invalid contract path #{template_file}"
        end

        # load the ddah as a Liquid template
        template = Liquid::Template.parse(File.read(template_file))

        # font.css and header.css contain base64-encoded data since we need all
        # data to be embedded in the HTML document
        styles = {
            'style_font' => File.read("#{contract_dir}/font.css"),
            'style_header' => File.read("#{contract_dir}/header.css")
        }

        subs =
            { ddahs: ddah_signature_list_substitutions(ddahs) }.merge(styles)
                .stringify_keys
        template.render(subs)
    end

    # Prepare a hash to be used by a Liquid
    # template based on the ddahs list
    def ddah_signature_list_substitutions(ddahs)
        ddahs
            .map do |x|
                {
                    position_code: x.assignment.position.position_code,
                    hours: x.hours,
                    first_name: x.assignment.applicant.first_name,
                    last_name: x.assignment.applicant.last_name,
                    signature: x.signature,
                    signed_date: x.accepted_date
                }
            end
            .sort_by { |x| [x[:position_code], x[:last_name], x[:first_name]] }
            .as_json
            .map(&:stringify_keys)
    end
end
