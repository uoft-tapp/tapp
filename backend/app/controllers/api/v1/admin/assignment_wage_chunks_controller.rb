# frozen_string_literal: true

class Api::V1::Admin::AssignmentWageChunksController < ApplicationController
    before_action :find_assignment

    # GET /wage_chunks
    def index
        render_success @assignment.wage_chunks
    end

    # POST /wage_chunks
    def create
        service =
            AssignmentWageChunkCreateService.new(
                assignment: @assignment,
                wage_chunk_params: wage_chunks_create_params
            )
        start_transaction_and_rollback_on_exception do
            service.perform
            render_success service.values
        end
    end

    private

    def find_assignment
        @assignment = Assignment.find(params[:assignment_id])
    end

    def wage_chunks_create_params
        params.permit(_json: %i[id start_date end_date hours rate]).dig(:_json)
    end
end
