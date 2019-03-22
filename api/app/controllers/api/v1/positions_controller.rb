# frozen_string_literal: true

module Api::V1
  # Controller for Positions
  class PositionsController < ApplicationController
    before_action :set_position, only: %i[show update destroy]

    # GET /positions
    def index
      @positions = Position.order(:id)

      render json: @positions
    end

    # GET /positions/1
    def show
      render json: @position
    end

    # POST /positions
    def create
      @position = Position.new(position_params)

      if @position.save
        render json: @position, status: :created
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

     # POST /positions/import
     def import
      @position = Position.new(position_params)

      if @position.valid?
        if @position.save
          render json: @position, status: :created
        else
          render json: @position.errors, status: :unprocessable_entity
        end
      else
        #check whether the error lies in uniqueness alone
        if @position.errors.details.length == 1 &&  @position.errors["course_code"] == ["course duplicated in same session"]
          # safe to update since there's no other errors
          @exists = Position.where('course_code = ? AND session_id = ?', params[:course_code], params[:session_id])
          if @exists.update(position_params)
            render json: @exists
          else
            render json: @exists.errors, status: :unprocessable_entity
          end
          
        else
          render json: @position.errors, status: :unprocessable_entity
        end
      end
    end

    # PATCH/PUT /positions/1
    def update
      if @position.update(position_params)
        render json: @position
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

    # DELETE /positions/1
    def destroy
      if @position.destroy
        head :no_content, status: :ok
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

    private

    # Use callbacks to share common setup or constraints between actions.
    def set_position
      @position = Position.find(params[:id])
    end

    # Only allow a trusted parameter "white position" through.
    def position_params
      params.permit(
        :cap_enrolment, :course_code, :course_name, :current_enrolment, :duties, :hours,
        :num_waitlisted, :openings, :qualifications, :session_id,
        :start_date, :end_date
      )
    end
  end
end
