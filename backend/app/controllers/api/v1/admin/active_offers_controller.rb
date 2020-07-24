# frozen_string_literal: true

class Api::V1::Admin::ActiveOffersController < ApplicationController
    before_action :find_assignment

    # GET /active_offers
    # Return the active_offer associated with an Assignment
    def index
        render_success @assignment.active_offer
    end

    # POST /active_offers/create
    # Create an active_offer for an Assignment
    def create
        if @assignment.active_offer.present?
            render_error(message: I18n.t('active_offers.already_exists'))
            return
        end

        start_transaction_and_rollback_on_exception do
            offer = @assignment.offers.create!
            @assignment.update!(active_offer: offer)
            render_success @assignment
        end
    end

    # POST /active_offers/accept
    # Accepts the active_offer for the specified Assignment
    def accept
        @assignment.active_offer.accepted!
        render_success @assignment.active_offer
    end

    # POST /active_offers/reject
    # Rejects the active_offer for the specified Assignment
    def reject
        @assignment.active_offer.rejected!
        render_success @assignment.active_offer
    end

    # POST /active_offers/withdraw
    # Withdraws the active_offer for the specified Assignment
    def withdraw
        @assignment.active_offer.withdrawn!
        render_success @assignment.active_offer
    end

    # POST /active_offers/email
    # Emails the active offer for the specified Assignment
    def email
        # Check state first
        #  - if accepted, don't change the state, but still send
        #  - if withdrawn or rejected, don't send
        offer = @assignment.active_offer

        if !offer.present?
            render_error(message: I18n.t('active_offers.does_not_exist'))
            return
        elsif offer.withdrawn? || offer.rejected?
            render_error(message: I18n.t('active_offers.invalid_offer'))
            return
        end
        url = Rails.application.config.base_url
        # TODO:  This seems too hard-coded.  Is there another way to get the route?
        link = "#{url}/public/contracts/#{@assignment.active_offer.url_token}/view"

        OfferMailer.contract_email(@assignment, link).deliver_now!
        # If the assignment has not been sent before, set status to pending
        if offer.provisional?
            offer.pending!
        end
        render_success @assignment.active_offer
    end

    # POST /active_offers/nag
    # Sends a nag email for the active_offer for the specified Assignment
    # which has already been emailed once
    def nag; end

    private

    def find_assignment
        @assignment = Assignment.find(params[:assignment_id])
    end
end
