# frozen_string_literal: true

class Api::V1::Admin::AssignmentWageChunksController < ApplicationController
    before_action :find_assignment

    # GET /wage_chunks
    def index
        render_success @assignment.wage_chunks
    end

    # POST /wage_chunks
    # This particular route replace all existing wage chunks for the given assignment
    # with the wage chunks provided through API calls
    def create
        start_transaction_and_rollback_on_exception do
            # Upsert the list of wage chunks
            result =
                wage_chunks_create_params.map do |wage_chunk_params|
                    service =
                        AssignmentWageChunkCreateService.new(wage_chunk_params)
                    service.upsert
                    service.wage_chunk
                end

            # Find all the extra wage chunks (i.e. the ones that is not included in the
            # new wage chunk list) and remove them
            delete_extra_wage_chunks(result.map(&:id))
            render_success result
        end
    end

    private

    def delete_extra_wage_chunks(ids)
        @assignment.wage_chunks.where.not(id: ids).delete_all
    end

    def find_assignment
        @assignment = Assignment.find(params[:assignment_id])
    end

    def wage_chunks_create_params
        ret_params =
            params.permit(
                _json: %i[id assignment_id start_date end_date hours rate]
            ).dig(:_json)
        if params[:assignment_id]
            ret_params =
                ret_params.map do |obj|
                    obj.merge(assignment_id: params[:assignment_id])
                end
        end
        ret_params
    end
end
