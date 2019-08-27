# frozen_string_literal: true

module Api::V1
    # Controller for Offers
    class OffersController < ApplicationController
        before_action :set_assignment, only: [:create, :active_offer, :email_offer, :withdraw_offer, :nag]
        before_action :set_offer, only: [:reject_offer, :accept_offer]
        # POST /offers
        def create
            offer = Offer.new(@assignment.offer_params)
            if offer.save
                render_success(offer)
            else
                render_error(offer.errors)
            end
        end

        # GET /offers/:url_token
        def show 
            params.require(:id)
            offer = Offer.find_by(url_token: params[:id])
            if offer
                render_success(offer)
            else
                render_error("offer does not exist")
            end
        end 

        # GET /active_offer
        def active_offer
            if @assignment.active_offer.present?
                render_success(@assignment.active_offer)
            else
                render_error("no active offer")
            end
        end

            

        # POST /email_offer
        def email_offer
            if @assignment.active_offer.present?
                OfferMailer.with(offer: @assignment.active_offer).contract_email.deliver_later
            end 
        end

        def withdraw_offer
            if @assignment.withdraw_active_offer
                render_success(@assignment.active_offer)
            else
                render_error('no active offer')
            end
        end

        def reject_offer
            if @offer.update_attribute(:rejected_date, Time.zone.now)
                render_success(@offer)
            else
                render_error(@offer.errors)
            end
        end 

        def accept_offer
            params.require(:signature)
            if @offer.update_attributes({signature: params[:signature], accepted_date: Time.zone.now})
                render_success(@offer)
            else
                render_error(@offer.errors)
            end
        end

        def nag
            if @assignment.active_offer.present?
                OfferMailer.with(offer: @assignment.active_offer).nag_email.deliver_later
            end 
        end

        private 

        def set_assignment
            params.require(:assignment_id)
            assignment_id = params[:assignment_id]
            if Assignment.exists?(assignment_id)
                @assignment = Assignment.find(assignment_id)
            else
                render_error("assignment #{assignment_id} does not exist.")
            end
        end

        def set_offer 
            params.require(:url_token)
            offer_token = params[:url_token]
            if Offer.find_by(url_token: offer_token).present?
                @offer = Offer.find_by(url_token: offer_token)
            else 
                render_error("offer #{offer_token} does not exist.")
            end 
        end
 
    end
end
