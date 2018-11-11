# frozen_string_literal: true

module Api::V1
  # Controller for Instructors
  class InstructorsController < ApplicationController
    before_action :set_instructor, only: %i[show update destroy]

    # GET /instructors
    def index
      @instructors = Instructor.order(:id)

      render json: @instructors
    end

    # GET /instructors/1
    def show
      render json: @instructor
    end

    # POST /instructors
    def create
      @instructor = Instructor.new(instructor_params)

      if @instructor.save
        render json: @instructor, status: :created
      else
        render json: @instructor.errors, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /instructors/1
    def update
      if @instructor.update(instructor_params)
        render json: @instructor
      else
        render json: @instructor.errors, status: :unprocessable_entity
      end
    end

    # DELETE /instructors/1
    def destroy
      if @instructor.destroy
        head :no_content, status: :ok
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

    private

    def set_instructor
      @instructor = Instructor.find(params[:id])
    end

    def instructor_params
      params.permit(
        :email, :first_name, :last_name, :utorid
      )
    end
  end
end
