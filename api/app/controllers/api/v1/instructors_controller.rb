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

        # POST /instructors AND /add_instructor
        def create
            if not params.include?(:position_id)
                instructor = Instructor.new(instructor_params)
                instructor_create(instructor)
            else
                position = Position.find(params[:position_id])
                instructor = position.instructors.new(instructor_params)
                instructor_create(instructor, true)
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

        # /instructors/delete or /instructors/:id/delete
        def delete
            params.require(:id)
            instructor = Instructor.find(params[:id])
            if session.destroy!
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

        def validate_position_ids
            params.require(:position_ids)
            if params[:position_ids] == ['']
                return
            end
            params[:position_ids].each do |id|
                Position.find(id)
            end
        end

        
        def instructor_create(instructor, filter = false)
            if filter
                result = error = instructors_by_position
            else
                result = instructor
                error = {}
            end
            if instructor.save # passes Instructor model validation
                render_success(result)
            else
                instructor.destroy!
                render_error(instructor.errors, error)
            end
        end
    end
end
