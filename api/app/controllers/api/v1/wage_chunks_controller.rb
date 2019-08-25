# frozen_string_literal: true

module Api::V1
    # Controller for WageChunks
    class WageChunksController < ApplicationController
        # GET /applicants
        def index
            index_response(WageChunk, Assignment, wage_chunks_by_assignment)
        end

        # POST /add_wage_chunk
        def create
            update && return if update_condition(WageChunk)
            return if invalid_id_check(Assignment)

            output = proc { wage_chunks_by_assignment }
            create_entry(WageChunk, wage_chunk_params, output: output)
        end

        def update
            update_entry(WageChunk, wage_chunk_update_params)
        end

        # POST /wage_chunks/delete
        def delete
            delete_entry(WageChunk)
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
            filter_given_id(WageChunk, :assignment_id)
        end
    end
end
