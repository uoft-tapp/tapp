# frozen_string_literal: true

module Api::V1
    # Controller for Offers
    class OffersController < ApplicationController


        # GET /offers
        def index
            render_success(Offer.order(:id))
        end

        # POST /offer
        def create

            if invalid_id(Session, :session_id) then return end
            offer = Offer.new(offer_params)
            if not offer.save # does not pass offer model validation
                offer.destroy!
                render_error(offer.errors.full_messages.join("; "))
                return
            end
            params[:offer_id] = offer[:id]
            message = valid_ad_and_matching(offer.errors.messages)
            if not message
                render_success(offer)
            else
                offer.destroy!
                render_error(message)
            end
        end

        # GET /active_offer
        def active_offer
          def index
              render_success(offers_by_session)
          end
        end

        # POST /email_offer
        def email_offer
            # TODO
            render_error('')
        end

        # POST /respond_to_offer
        def respond
            # TODO
            render_error('')
        end

        private
        # Only allow a trusted parameter "white position" through.
        def offer_params
            params.permit(
                :assignment_id,
                :accepted_date,
                :email,
                :emailed_date,
                :first_name,
                :first_time_ta,
                :installments,
                :instructor_contact_desc,
                :last_name,
                :nag_count,
                :offer_override_pdf,
                :offer_template,
                :pay_period_desc,
                :position_code,
                :position_end_date,
                :position_start_date,
                :position_title,
                :rejected_date,
                :signature,
                :ta_coordinator_email,
                :ta_coordinator_name,
                :withdrawn_date,
                :assignment_id
            )
        end
    end
end
