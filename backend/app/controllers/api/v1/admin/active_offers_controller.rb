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
        OfferMailer.contract_email(@assignment.active_offer, "a url").deliver_now!
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
