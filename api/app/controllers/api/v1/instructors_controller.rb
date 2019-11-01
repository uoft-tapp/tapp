# frozen_string_literal: true

# Controller for Instructors
class Api::V1::InstructorsController < ApplicationController
    before_action :find_instructor, except: %i[index]

    # GET /instructors
    def index
        if params[:position_id].blank?
            render_success(Instructor.order(:id))
            return
        end
        return if invalid_id?(Position, :position_id)

        render_success Instructor.by_position
    end

    # GET /session/:id/instructors
    def instructor_by_session
        instructors = Instructor.by_session_id(params[:session_id])
        if instructors.blank?
            render_error "No instructors associated with this session #{id}"
        else
            render_success instructors
        end
    end

    # POST /instructors AND /add_instructor
    def create
        # if we passed in an id that exists, we want to update
        if params[:id].present? && @instructor.present?
            update
            return
        end

        if params.include?(:position_id)
            position = Position.find(params[:position_id])
            instructor_create position
        else
            instructor_create
        end
    end

    def update
        if @instructor.update_attributes!(instructor_params)
            render_success @instructor
        else
            render_error @instructor.errors
        end
    end

    # POST /instructors/delete
    def delete
        if instructor.destroy!
            render_success instructor
        else
            render_error instructor.errors.full_messages.join('; ')
        end
    end

    # POST /session/:id/instructors/delete
    # FIXME: This routing doesn't seem right...
    def delete_instructor_by_session
        # delete an instructor from session is essentially remove
        # the instructor from the all positions of that session
        positions = instructor.positions.where(session_id: params[:session_id])
        num_positions_deleted = instructor.positions.delete(positions)
        if positions.count == num_positions_deleted
            render_success instructor
        else
            # FIXME: This could error out
            render_error instructor.errors
        end
    end

    # POST /positions/:id/instructors/delete
    # FIXME: route is incorrect..?
    def delete_instructor_by_position
        positions = instructor.positions.where(position_id: params[:position_id])
        num_positions_deleted = instructor.positions.delete(positions)
        if positions.count == num_positions_deleted
            render_success instructor
        else
            render_error instructor.errors
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

    def instructor_create(position = false)
        instructor = Instructor.new(instructor_params)
        instructors_by_position = Instructor.by_position
        error = if position
                    instructors_by_position
                else
                    {}
                end
        if instructor.save
            if position
                position.instructors.push(instructor)
                render_success instructors_by_position
            else
                render_success instructor
            end
        else
            render_error(instructor.errors.full_messages.join('; '), error)
        end
    end

    def find_instructor
        @instructor = Instructor.find(params[:id])
    end
end
