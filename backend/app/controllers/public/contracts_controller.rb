# frozen_string_literal: true

# `ApplicationControler` is set to always return JSON. In this controller we want to return
# html and pdf, so we subclass ActionController directly
class Public::ContractsController < ActionController::Base
    def show
        offer = Offer.find_by_url_token(show_params[:id])

        unless offer
            render status: 404,
                   inline: "No offer found with id='#{show_params[:id]}'"
            return
        end

        # for PDF and HTML rendering, we start by rendering the contract as an html document
        rendered = get_contract_html(offer)
        if !show_params[:format].blank? &&
               show_params[:format].downcase == 'pdf'
            pdf_name = "#{offer.position_code}-contract-#{offer.last_name}"
            render pdf: pdf_name, inline: rendered
            return
        end

        render(inline: rendered)
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
        subs = {
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
            status: offer.status
        }
        subs = subs.merge(styles).stringify_keys
        rendered = template.render(subs)
    end
end
