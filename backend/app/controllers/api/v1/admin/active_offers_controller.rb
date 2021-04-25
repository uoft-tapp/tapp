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
        if @assignment.active_offer.present? &&
               @assignment.active_offer.status != 'withdrawn'
            render_error(message: I18n.t('active_offers.already_exists'))
            return
        end

        start_transaction_and_rollback_on_exception do
            offer = @assignment.offers.create!
            @assignment.update!(active_offer: offer)
            render_success @assignment.active_offer
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
        return unless can_be_emailed

        OfferMailer.email_contract(@offer).deliver_now!

        if @offer.provisional?
            # If the assignment has not been sent before, set status to pending
            @offer.pending!
        else
            # If the assignment has been sent before, make sure the emailed date gets updated.
            @offer.emailed_date = Time.zone.now
            @offer.save!
        end
        render_success @offer
    end

    # POST /active_offers/nag
    # Sends a nag email for the active_offer for the specified Assignment
    # which has already been emailed once
    def nag
        return unless can_be_emailed

        # We cannot nag unless an email has already been sent and the offer
        # has not been accepted/rejected
        unless @offer.pending?
            render_error(
                message: I18n.t('active_offers.not_pending_so_dont_nag')
            )
            return
        end

        @offer.nag_count += 1
        @offer.save!
        OfferMailer.email_nag(@offer).deliver_now!
        render_success @offer
    end

    # GET /active_offers/history
    # Fetches the history for past offers ordered by emailed_date
    def history
        render_success Offer.where(assignment: @assignment).order(
                           created_at: :desc
                       )
    end

    private

    def can_be_emailed
        @offer = @assignment.active_offer

        # Check state first
        #  - if accepted, don't change the state, but still send
        #  - if withdrawn or rejected, don't send
        if !@offer.present?
            render_error(message: I18n.t('active_offers.does_not_exist'))
            return false
        elsif @offer.withdrawn? || @offer.rejected?
            render_error(message: I18n.t('active_offers.invalid_offer'))
            return false
        end

        true
    end

    def find_assignment
        @assignment = Assignment.find(params[:assignment_id])
    end
end
