# frozen_string_literal: true

module Api::V1
    # Controller for Offers
    class OffersController < ApplicationController
        before_action :set_assignment

        # POST /create_offer
        def create
            offer = Offer.new(@assignment.offer_params)
            if offer.save
                render_success(offer)
            else
                render_error(offer.errors)
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
            # TODO
            render_error('')
        end

        def withdraw_offer
            if @assignment.withdraw_active_offer
                render_success(@assignment.active_offer)
            else
                render_error('no active offer')
            end
        end

        def reject_offer
            if @assignment.reject_active_offer
                render_success(@assignment.active_offer)
            else
                render_error('no active offer')
            end
        end 

        def accept_offer
            params.require(:signature)
            if @assignment.accept_active_offer(params[:signature])
                render_success(@assignment.active_offer)
            else
                render_error('no active offer')
            end
        end

        def nag
            if @assignment.nag
                render_success(@assignment.active_offer)
            else
                render_error('no active offer')
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
    end
end
