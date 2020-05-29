# frozen_string_literal: true

class Api::V1::Admin::InstructorsController < ApplicationController
    # GET /instructors
    def index
        render_success Instructor.all
    end

    # POST /instructors
    def create
        @instructor = Instructor.find_by(id: params[:id])
        update && return if @instructor
        @instructor = Instructor.new(instructor_params)
        render_on_condition(
            object: @instructor, condition: proc { @instructor.save! }
        )
    end

    # POST /instructors/delete
    def delete
        @instructor = Instructor.find(params[:id])
        @instructor.positions.clear
        render_on_condition(
            object: @instructor, condition: proc { @instructor.destroy! }
        )
    end

    private

    def instructor_params
        params.permit(:first_name, :last_name, :email, :utorid)
    end

    def update
        render_on_condition(
            object: @instructor,
            condition: proc { @instructor.update!(instructor_params) }
        )
    end
end
