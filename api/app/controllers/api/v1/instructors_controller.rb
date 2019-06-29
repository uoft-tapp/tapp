# frozen_string_literal: true

module Api::V1
    # Controller for Instructors
    class InstructorsController < ApplicationController

        # GET /instructors
        def index
            if not params.include?(:position_id)
                render json: { status: 'success', message: '', payload: Instructor.order(:id) }
                return
            end
            if Position.exists?(id: params[:position_id])
                render json: { status: 'success', message: '', payload: instructors_by_position }
            else
                render json: { status: 'error', message: 'Invalid position_id', payload: {} }
            end
        end

        # POST /add_instructor
        def create
            position = Position.find_by(id: params[:position_id])
            if position
                instructor = position.instructors.new(instructor_params)
                if instructor.save
                    render json: { status: 'success', message: '', payload: instructors_by_position }
                else
                    render json: { status: 'error', message: instructor.errors, payload: instructors_by_position }
                end
            else
                render json: { status: 'error', message: 'Invalid position_id', payload: instructors_by_position }
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

    def instructors_by_position
        return Instructor.order(:id).each do |entry|
            entry.position_ids.include?(params[:position_id].to_i)
        end
    end
  end
end
