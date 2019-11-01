# frozen_string_literal: true

module Api::V1
    # Controller for Offers
    class OffersController < ApplicationController
        before_action :find_assignment, only: %i[create active_offer email_offer withdraw_offer nag]
        before_action :find_offer, only: %i[show accept reject]
        before_action :find_contract_template, only: %i[show]

        # POST /offers
        def create
            offer = Offer.new(@assignment.offer_params)
            offer.save ? render_success(offer) : render_error(offer.errors)
        end

        # GET /offers/:url_token
        def show
            respond_to do |format|
                format.html
                format.pdf do
                    render pdf: 'offer', inline: @rendered_contract
                end
            end
        end

        # GET /active_offer
        def active_offer
            if @assignment.active_offer.present?
                render_success(@assignment.active_offer)
            else
                render_error('no active offer')
            end
        end

        # POST /email_offer
        def email_offer
            if @assignment.active_offer.present?
                OfferMailer.with(offer: @assignment.active_offer).contract_email.deliver_later
                render_success('emailed queued')
            else
                render_error('no active offer')
            end
        end

        def withdraw_offer
            if @assignment.withdraw_active_offer
                render_success(@assignment.active_offer)
            else
                render_error('no active offer')
            end
        end

        def accept
            if @offer.update(signature: params[:signature],
                             accepted_date: Time.zone.now,
                             status: :accepted)
                render_success(@offer)
            else
                render_error(@offer.errors)
            end
        end

        def reject
            if @offer.update(rejected_date: Time.zone.now, status: :rejected)
                render_success(@offer)
            else
                render_error(@offer.errors)
            end
        end

        def nag
            if @assignment.active_offer.present?
                OfferMailer.with(offer: @assignment.active_offer).nag_email.deliver_later
                render_success('emailed queued')
            else
                render_error('no active offer')
            end
        end

        private

        def find_assignment
            @assignment = Assignment.find_by(assignment_id: params[:assignment_id])
            if @assignment.blank?
                render_error("assignment #{assignment_id} does not exist.")
                return
            end
        end

        def find_offer
            @offer = Offer.find_by(url_token: params[:url_token])
            if @offer.blank?
                render_error("offer #{params[:url_token]} does not exist.")
                return
            end
        end

        def find_contract_template
            offer_template = File.read("#{CONTRACT_DIR}/offer-template.html")
            template = Liquid::Template.parse(offer_template)
            styles = { 'style_font' => File.read("#{CONTRACT_DIR}/font.css"),
                       'style_header' => File.read("#{CONTRACT_DIR}/header.css") }
            subs = @offer.format.merge(styles)
            @rendered_contract = template.render(subs)
        end
    end
end
