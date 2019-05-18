# frozen_string_literal: true

module Api::V1
  # Controller for Assignments
	class AssignmentsController < ApplicationController
    before_action :set_assignment, only: %i[show update]
    # GET /assignments
    def index
      @assignment = Assignment.order(:id)

      render json: @assignment
    end

    # GET /assignments/1
    def show
      render json: @assignment
    end

    # POST /assignments
    def create
      position = Position.find(params[:position_id])
      applicant = Applicant.find(params[:applicant_id])
      params[:start_date] = position[:start_date]
      params[:end_date] = position[:end_date]
      params[:status] = 0
      @assignment = Assignment.new(assignment_params)
      if @assignment.save
        render json: @assignment, status: :created
      else
        render json: @assignment.errors, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /assignments/1
    def update
      updated_at = @assignment[:updated_at]
      if @assignment.update(update_assignment_params)
        # creates a copy of assignment if changed are made after being sent
        if @assignment[:status] > 0
          log_offer
        end
        render json: @assignment
      else
        render json: @assignment.errors, status: :unprocessable_entity
      end
    end

   	private
    def set_assignment
      @assignment = Assignment.find(params[:id])
    end

   	def assignment_params
      params.permit(
        :id,
        :applicant_id,
        :position_id,
        :hours,
        :pay1,  
        :pay2,
        :status,
        :start_date,
        :end_date,
      )
    end
    def update_assignment_params
      params.permit(
        :hours,
        :pay1,  
        :pay2,
        :start_date,
        :end_date,
      )
    end

    def log_offer
      offer = Offer.new(
        assignment_id: @assignment[:id],
        hours: @assignment[:hours],
        pay1: @assignment[:pay1],  
        pay2: @assignment[:pay2],
        status: @assignment[:status],
        start_date: @assignment[:start_date],
        end_date: @assignment[:end_date],
      )
      if !offer.save
        render json: offer.errors, status: :unprocessable_entity
      end
    end
	end
end
