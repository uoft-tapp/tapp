# frozen_string_literal: true

module Api::V1
    # Controller for WageChunks
    class WageChunksController < ApplicationController

        # GET /applicants
        def index
            if not params.include?(:assignment_id)
                render_success(WageChunk.order(:id))
                return
            end
            if invalid_id(Assignment, :assignment_id) then return end
            render_success(wage_chunks_by_assignment)
        end

        # POST /add_wage_chunk
        def create
            if invalid_id(Assignment, :assignment_id, []) then return end
            wage_chunk = WageChunk.new(wage_chunk_params)
            if wage_chunk.save # passes WageChunk model validation
                render_success(wage_chunks_by_assignment)
            else
                render_error(wage_chunk.errors, wage_chunks_by_assignment)
            end
        end

        private
        def wage_chunk_params
            params.permit(
                :end_date,
                :hours,
                :rate,
                :start_date,
                :assignment_id,
            )
        end

        def wage_chunks_by_assignment
            return WageChunk.order(:id).each do |entry|
                entry[:assignment_id] == params[:assignment_id].to_i
            end
        end
    end
end
