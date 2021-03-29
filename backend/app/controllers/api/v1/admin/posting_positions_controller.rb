# frozen_string_literal: true

class Api::V1::Admin::PostingPositionsController < ApplicationController
    # GET /sessions/:session_id/postings
    def index
        render_success PostingPosition.by_session(params[:session_id])
    end

    # GET /postings/:posting_id/posting_positions
    def show
        # `show` is called for both `index` and `show`. To differentiate between
        # the two, we look for the precense of an `id` field. If it's there, we
        # want to see that single posting_position; otherwise, we want all posting_positions
        # for the specified posting.
        if params[:id].blank?
            find_posting
            render_success @posting.posting_positions
        else
            render_success PostingPosition.find(params[:id])
        end
    end

    # POST /postings/:posting_id/posting_positions
    def create
        find_posting
        find_posting_position
        upsert
        render_success @posting_position
    end

    # POST /posting_positions/delete
    def delete
        @posting_position =
            PostingPosition.find_by(
                position_id: params[:position_id],
                posting_id: params[:posting_id]
            )
        render_on_condition(
            object: @posting_position,
            condition: proc { @posting_position.destroy! }
        )
    end

    private

    def find_posting
        @posting = Posting.find(params[:posting_id])
    end

    def upsert
        if @posting_position
            start_transaction_and_rollback_on_exception do
                @posting_position.update!(update_params)
            end
        else
            start_transaction_and_rollback_on_exception do
                @posting_position = PostingPosition.new(create_params)
                @posting_position.save!
            end
        end
    end

    def find_posting_position
        # Since there is only one posting_position per position_id, we can
        # look up a posting_position by either its id or it's position_id.
        @posting_position =
            PostingPosition.find_by(id: params[:id]) ||
                @posting.posting_positions.find_by(
                    position_id: params[:position_id]
                )
    end

    def update_params
        params.slice(:hours, :num_positions).permit!
    end

    def create_params
        params.slice(:hours, :num_positions, :position_id, :posting_id).permit!
    end
end
