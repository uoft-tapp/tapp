# frozen_string_literal: true

class Api::V1::Admin::WageChunksController < ApplicationController
    # POST /wage_chunks
    def create
        start_transaction_and_rollback_on_exception do
            service = AssignmentWageChunkCreateService.new(wage_chunks_create_params)
            service.upsert
            render_success service.wage_chunk
        end
    end

    # DELETE /wage_chunks/delete
    def delete
        @wage_chunk = WageChunk.find(params[:id])
        render_on_condition(
            object: @wage_chunk, condition: proc { @wage_chunk.destroy! }
        )
    end

    private

    def wage_chunks_create_params
        params.permit(:assignment_id, :start_date, :end_date, :hours, :rate, :id)
    end
end
