# frozen_string_literal: true

module Api::V1
    # Controller for Instructors
    class InstructorsController < ApplicationController

        # GET /instructors
        def index
            render json: { status: 'success', message: '', payload: Instructor.order(:id) }
        end

        # POST /instructors
        def create
            instructor = Instructor.new(instructor_params)
            if instructor.save
                index
            else
                render json: { status: 'error', message: instructor.errors, payload: Instructor.order(:id) }
            end
        end

    private
    def instructor_params
      params.permit(
        :id,
        :email, 
        :first_name, 
        :last_name, 
        :utorid
      )
    end
  end
end
