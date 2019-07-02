# frozen_string_literal: true

module Api::V1
    # Controller for Instructors
    class InstructorsController < ApplicationController

        # GET /instructors
        def index
            if not params.include?(:position_id)
                render_success(Instructor.order(:id))
                return
            end
            if invalid_id(Position, :position_id) then return end
            render_success(instructors_by_position)
        end

        # POST /add_instructor
        def create
            position = Position.find(params[:position_id])
            instructor = position.instructors.new(instructor_params)
            if instructor.save # passes Instructor model validation
                render_success(instructors_by_position)
            else
                instructor.destroy!
                render_error(instructor.errors, instructors_by_position)
            end
        end

        # PUT/PATCH /instructors/:id
        def update
            instructor = Instructor.find(params[:id])
            validate_position_ids
            instructor.position_ids = params[:position_ids] 
            if instructor.update_attributes!(instructor_params)
                render_success(instructor)
            else
                render_error(instructor.errors)
            end
        end

        private
        def instructor_params
          params.permit(
            :email, 
            :first_name, 
            :last_name, 
            :utorid
          )
        end

        def instructors_by_position
            return Instructor.order(:id).each do |entry|
                entry.position_ids.include?(params[:position_id].to_i)
            end
        end

        def validate_position_ids
            params.require(:position_ids)
            params[:position_ids].each do |id|
                Position.find(id)
            end
        end
    end
end
