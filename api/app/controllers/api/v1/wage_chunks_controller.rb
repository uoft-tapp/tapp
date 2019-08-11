# frozen_string_literal: true

module Api::V1
  # Controller for WageChunks
  class WageChunksController < ApplicationController
    # GET /applicants
    def index
      unless params.include?(:assignment_id)
        render_success(WageChunk.order(:id))
        return
      end
      return if invalid_id(Assignment, :assignment_id)

      render_success(wage_chunks_by_assignment)
    end

    # POST /add_wage_chunk
    def create
      # if we passed in an id that exists, we want to update
      update && return if params.key?(:id) && WageChunk.exists?(params[:id])
      return if invalid_id(Assignment, :assignment_id, [])

      wage_chunk = WageChunk.new(wage_chunk_params)
      if wage_chunk.save # passes WageChunk model validation
        render_success(wage_chunks_by_assignment)
      else
        wage_chunk.destroy!
        render_error(wage_chunk.errors, wage_chunks_by_assignment)
      end
    end

    def update
      wage_chunk = WageChunk.find(params[:id])
      if wage_chunk.update_attributes!(wage_chunk_update_params)
        render_success(wage_chunk)
      else
        render_error(wage_chunk.errors)
      end
    end

    # POST /wage_chunks/delete
    def delete
      params.require(:id)
      wage_chunk = WageChunk.find(params[:id])
      if wage_chunk.destroy!
        render_success(wage_chunk)
      else
        render_error(wage_chunk.errors.full_messages.join('; '))
      end
    end

    private

    def wage_chunk_params
      params.permit(
        :end_date,
        :hours,
        :rate,
        :start_date,
        :assignment_id
      )
    end

    def wage_chunk_update_params
      params.permit(
        :end_date,
        :hours,
        :rate,
        :start_date,
        :assignment_id
      )
    end

    def wage_chunks_by_assignment
      WageChunk.order(:id).each do |entry|
        entry[:assignment_id].should be == params[:assignment_id].to_i
      end
    end
  end
end
