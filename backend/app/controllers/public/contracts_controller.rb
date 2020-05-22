# frozen_string_literal: true

# `ApplicationControler` is set to always return JSON. In this controller we want to return
# html and pdf, so we subclass ActionController directly
class Public::ContractsController < ActionController::Base
    include Response
    include TransactionHandler

    # /public/contracts/<id>
    def show
        return unless valid_offer?(url_token: show_params[:id])

        # for PDF and HTML rendering, we start by rendering the contract as an html document
        rendered = get_contract_html(@offer)
        if !show_params[:format].blank? &&
               show_params[:format].downcase == 'pdf'
            pdf_name = "#{@offer.position_code}-contract-#{@offer.last_name}"
            render pdf: pdf_name, inline: rendered
            return
        end

        render(inline: rendered)
    end

    # /public/contracts/<contract_id>/accept
    def accept
        return unless valid_offer?(url_token: params[:contract_id])

        unless @offer.can_accept?
            render_error(
                message:
                    'Cannot accept an offer that is already accepted/rejected/withdrawn'
            ) && return
        end

        start_transaction_and_rollback_on_exception do
            @offer.signature = params[:signature]
            @offer.accepted!
            @offer.save!
        end
        render_success {}
    end

    # /public/contracts/<contract_id>/reject
    def reject
        return unless valid_offer?(url_token: params[:contract_id])

        unless @offer.can_reject?
            render_error(
                message:
                    'Cannot reject an offer that is already accepted/rejected/withdrawn'
            ) && return
        end

        start_transaction_and_rollback_on_exception do
            @offer.rejected!
            @offer.save!
        end
        render_success {}
    end

    # /public/contracts/<contract_id>/view
    def view
        return unless valid_offer?(url_token: params[:contract_id])

        # render the view offer template as a liquid template
        template_root = Rails.root.join('app/views/contracts/')
        template_file = template_root.join('view-offer.html')
        template = Liquid::Template.parse(File.read(template_file))

        # We want everything to be served as a single HTML file with
        # scripts and css included. However, this is annoying in development.
        # To avoid additional build steps (like webpack, etc.), we just use
        # Liquid templates to stuff the css and JS directly into the html.
        header_subs = {
            'scripts' => File.read(template_root.join('view-offer.js')),
            'styles' => File.read(template_root.join('view-offer.css'))
        }

        render(inline: template.render(offer_substitutions.merge(header_subs)))
    end

    private

    def show_params
        params.permit(:id, :format)
    end

    def get_contract_html(offer)
        contract_dir = Rails.application.config.contract_template_dir
        template_file = "#{contract_dir}/#{offer.contract_template}"
        # Verify that the template file is actually contained in the template directory
        unless Pathname.new(template_file).realdirpath.to_s.starts_with?(
                   contract_dir
               )
            raise StandardError, "Invalid contract path #{template_file}"
        end

        # load the offer as a Liquid template
        template = Liquid::Template.parse(File.read(template_file))
        # font.css and header.css contain base64-encoded data since we need all
        # data to be embedded in the HTML document
        styles = {
            'style_font' => File.read("#{contract_dir}/font.css"),
            'style_header' => File.read("#{contract_dir}/header.css")
        }

        subs = offer_substitutions(offer: offer).merge(styles).stringify_keys
        template.render(subs)
    end

    # Prepare a hash to be used by a Liquid
    # template based on the offer
    def offer_substitutions(offer: @offer)
        {
            first_name: offer.first_name,
            last_name: offer.last_name,
            email: offer.email,
            position_code: offer.position_code,
            position_title: offer.position_title,
            start_date: offer.position_start_date,
            end_date: offer.position_end_date,
            first_time_ta: offer.first_time_ta,
            instructor_contact_desc: offer.instructor_contact_desc,
            pay_period_desc: offer.pay_period_desc,
            hours: offer.hours,
            installments: offer.installments,
            signature: offer.signature,
            accepted_date: offer.accepted_date,
            withdrawn_date: offer.withdrawn_date,
            rejected_date: offer.rejected_date,
            status: offer.status,
            url_token: offer.url_token
        }.stringify_keys
    end

    # tests to see if a valid offer exists corresponding to the specified
    # url token. Will render a 404 if not found. Should be used as
    #    return unless valid_offer?(...)
    #
    # Stores the found offer in `@offer`
    def valid_offer?(url_token: nil)
        offer = Offer.find_by_url_token(url_token)

        unless offer
            render status: 404, inline: "No offer found with id='#{url_token}'"
            return false
        end

        @offer = offer
    end
end
