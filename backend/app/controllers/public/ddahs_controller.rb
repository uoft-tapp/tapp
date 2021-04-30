# frozen_string_literal: true

# `ApplicationControler` is set to always return JSON. In this controller we want to return
# html and pdf, so we subclass ActionController directly
class Public::DdahsController < ActionController::Base
    include Response
    include TransactionHandler

    # /public/ddahs/<id>
    def show
        return unless valid_ddah?(url_token: show_params[:id])

        # for PDF and HTML rendering, we start by rendering the ddah as an html document
        rendered = get_contract_html(@ddah)
        if !show_params[:format].blank? &&
               show_params[:format].downcase == 'pdf'
            pdf_name =
                "#{@ddah.assignment.position.position_code}-ddah-#{
                    @ddah.assignment.applicant.last_name
                }"
            render pdf: pdf_name, inline: rendered
            return
        end

        render(inline: rendered)
    end

    # /public/ddahs/<ddah_id>/accept
    def accept
        return unless valid_ddah?(url_token: params[:ddah_id])

        unless @ddah.can_accept?
            render_error(
                message: 'Cannot accept an ddah that is already accepted'
            ) && return
        end

        start_transaction_and_rollback_on_exception do
            @ddah.signature = params[:signature]
            @ddah.accept
            @ddah.save!
        end
        render_success {}
    end

    # /public/ddahs/<ddah_id>/view
    def view
        return unless valid_ddah?(url_token: params[:ddah_id])

        # render the view ddah template as a liquid template
        template_root = Rails.root.join('app/views/ddahs/')
        template_file = template_root.join('view-ddah.html')
        template = Liquid::Template.parse(File.read(template_file))

        # We want everything to be served as a single HTML file with
        # scripts and css included. However, this is annoying in development.
        # To avoid additional build steps (like webpack, etc.), we just use
        # Liquid templates to stuff the css and JS directly into the html.
        header_subs = {
            'scripts' => File.read(template_root.join('view-ddah.js')),
            'styles' => File.read(template_root.join('view-ddah.css'))
        }

        render(inline: template.render(ddah_substitutions.merge(header_subs)))
    end

    private

    def show_params
        params.permit(:id, :format)
    end

    def get_contract_html(ddah)
        contract_dir = Rails.root.join('app/views/ddahs/')
        template_file = "#{contract_dir}/ddah-template.html"
        # Verify that the template file is actually contained in the template directory
        unless Pathname.new(template_file).realdirpath.to_s.starts_with?(
                   contract_dir.to_s
               )
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

        subs = ddah_substitutions(ddah: ddah).merge(styles).stringify_keys
        template.render(subs)
    end

    # Prepare a hash to be used by a Liquid
    # template based on the ddah
    def ddah_substitutions(ddah: @ddah)
        duties = ddah.duties.order(:order)
        ddah_service = DdahService.new ddah: ddah
        json_duties = ddah_service.categorized_duties
        total_hours = duties.sum(:hours)

        assignment = ddah.assignment
        position = assignment.position
        applicant = assignment.applicant
        {
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            position_code: position.position_code,
            position_title: position.position_title,
            instructor_desc:
                position.instructors.map(&:contact_info).to_sentence,
            signature: ddah.signature,
            accepted_date: ddah.accepted_date,
            url_token: ddah.url_token,
            duties: json_duties,
            total_hours: total_hours
        }.stringify_keys
    end

    # tests to see if a valid ddah exists corresponding to the specified
    # url token. Will render a 404 if not found. Should be used as
    #    return unless valid_ddah?(...)
    #
    # Stores the found ddah in `@ddah`
    def valid_ddah?(url_token: nil)
        ddah =
            Ddah.includes(:duties, assignment: %i[position applicant])
                .find_by_url_token(url_token)

        unless ddah
            render status: 404, inline: "No ddah found with id='#{url_token}'"
            return false
        end

        @ddah = ddah
    end
end
