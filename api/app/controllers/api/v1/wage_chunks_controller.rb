# frozen_string_literal: true

# Controller for WageChunks
class Api::V1::WageChunksController < ApplicationController
    before_action :find_wage_chunk, except: %i[index create]

    # GET /applicants
    def index
        if params[:assignment_id].blank?
            render_success WageChunk.order(:id)
            return
        end
        return if invalid_id?(Assignment, :assignment_id)

        render_success WageChunk.by_assignment(params[:assignment_id])
    end

    # POST /add_wage_chunk
    def create
        # if we passed in an id that exists, we want to update
        if params.key?(:id) && find_wage_chunk
            update
            return
        end

        return if invalid_id?(Assignment, :assignment_id, [])

        wage_chunk = WageChunk.new(wage_chunk_params)
        if wage_chunk.save
            render_success WageChunk.by_assignment(params[:assignment_id])
        else
            render_error(wage_chunk.errors, wage_chunks_by_assignment)
        end
    end

    def update
        if @wage_chunk.update_attributes!(wage_chunk_update_params)
            render_success @wage_chunk
        else
            render_error @wage_chunk.errors
        end
    end

    # POST /wage_chunks/delete
    def delete
        if @wage_chunk.destroy!
            render_success @wage_chunk
        else
            render_error @wage_chunk.errors.full_messages.join('; ')
        end
    end

    private

    def find_wage_chunk
        @wage_chunk = WageChunk.find_by(id: params[:id])
    end

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
end
