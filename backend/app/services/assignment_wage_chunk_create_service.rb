# frozen_string_literal: true

class AssignmentWageChunkCreateService
    attr_accessor :wage_chunk

    def initialize(wage_chunk_params)
        @wage_chunk_params = wage_chunk_params
    end

    def upsert
        @wage_chunk = WageChunk.find_by(id: @wage_chunk_params[:id])
        if @wage_chunk
            @wage_chunk.update!(@wage_chunk_params)
        else
            @wage_chunk = WageChunk.new(@wage_chunk_params)
            @wage_chunk.save!
        end
    end
end
