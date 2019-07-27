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
            return if invalid_id(Position, :position_id)
            render_success(instructors_by_position)
        end

        # POST /instructors AND /add_instructor
        def create
            # if we passed in an id that exists, we want to update
            if params.has_key?(:id) and Instructor.exists?(params[:id])
                update and return
            end
            if params.include?(:position_id)
                position = Position.find(params[:position_id])
                instructor_create(position)
            else
                instructor_create
            end
        end

        def update
            instructor = Instructor.find(params[:id])
            if instructor.update_attributes!(instructor_params)
                render_success(instructor)
            else
                render_error(instructor.errors)
            end
        end

        # POST /instructors/delete
        def delete
            params.require(:id)
            instructor = Instructor.find(params[:id])
            if instructor.destroy!
                render_success(instructor)
            else
                render_error(instructor.errors.full_messages.join("; "))
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

        def instructor_create(position = false)
            instructor = Instructor.new(instructor_params)
            if position
                error = instructors_by_position
            else
                error = {}
            end
            if instructor.save # passes Instructor model validation
                if position
                    position.instructors.push(instructor)
                    render_success(instructors_by_position)
                else
                    render_success(instructor)
                end
            else
                instructor.destroy!
                render_error(instructor.errors.full_messages.join("; "), error)
            end
        end
    end
end
