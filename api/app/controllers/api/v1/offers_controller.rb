# frozen_string_literal: true

module Api::V1
  # Controller for Offers
	class OffersController < ApplicationController
    before_action :set_offer, only: %i[show]
    # GET /offers
    def index
      @offer = Offer.order(:id)

      render json: @offer
    end

    # GET /offers/1
    def show
      render json: @offer
    end

   	private
    def set_offer
      @offer = Offer.find(params[:id])
    end

	end
end
