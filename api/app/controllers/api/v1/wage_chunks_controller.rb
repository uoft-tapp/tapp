# frozen_string_literal: true

module Api::V1
    # Controller for WageChunks
    class WageChunksController < ApplicationController

        # GET /applicants
        def index
            if not params.include?(:assignment_id)
                render json: { status: 'success', message: '', payload: WageChunk.order(:id) }
                return
            end
            if Assignment.exists?(id: params[:assignment_id])
                render json: { status: 'success', 
                    message: '', payload: wage_chunks_by_assignment }
            else
                render json: { status: 'error', message: 'Invalid assignment_id', payload: {} }
            end
        end

        # POST /add_wage_chunk
        def create
            if not Assignment.exists?(id: params[:assignment_id])
                render json: { status: 'error', message: 'Invalid assignment_id', payload: {} }
                return
            end
            wage_chunk = WageChunk.new(wage_chunk_params)
            if wage_chunk.save # passes WageChunk model validation
                render json: { status: 'success', 
                	message: '', payload: wage_chunks_by_assignment }
            else
                render json: { status: 'error', 
                	message: wage_chunk.errors, payload: wage_chunks_by_assignment }
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
