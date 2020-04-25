# frozen_string_literal: true

class Api::V1::Admin::WageChunksController < ApplicationController
    # POST /wage_chunks
    def create
        wage_chunk_id =
            WageChunk.upsert!(wage_chunks_create_params, returning: %i[id])
        render_succcess WageChunk.find(wage_chunk_id)
    end

    # DELETE /wage_chunks/delete
    def delete
        @wage_chunk = WageChunk.find(params[:id])
        render_condition(
            object: @wage_chunk, condition: proc { @wage_chunk.destroy! }
        )
    end

    private

    def wage_chunks_create_params
        params.permit(:start_date, :end_date, :hours, :rate)
    end
end
