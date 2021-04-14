# frozen_string_literal: true

class Api::V1::Admin::PostingsController < ApplicationController
    # GET /sessions/:session_id/postings
    def index
        find_session
        render_success @session.postings
    end

    # GET /postions/:posting_id
    def show
        render_success Posting.find(params[:id])
    end

    def create
        find_posting
        upsert
        render_success @posting
    end

    # POST /posting/delete
    def delete
        @posting = Posting.find(params[:id])
        render_on_condition(
            object: @posting, condition: proc { @posting.destroy! }
        )
    end

    # GET /postions/:posting_id/survey
    def survey
        posting = Posting.find(params[:posting_id])
        posting_service = PostingService.new(posting: posting)
        render_success posting_service.survey
    end

    private

    def find_session
        @session = Session.find(params[:session_id])
    end

    # This method may be manually called from other controllers. Because
    # of that, it doesn't render, instead leaving rendering up to the caller
    def upsert
        # update the posting if we have one
        if @posting
            start_transaction_and_rollback_on_exception do
                @posting.update!(posting_update_params)
            end
        else
            # create a new posting if one doesn't currently exist
            start_transaction_and_rollback_on_exception do
                @posting = Posting.new(posting_insert_params)
                @posting.save!
            end
        end
    end

    def find_posting
        # find_by will not throw an error if there's zero results
        @posting = Posting.find_by(id: params[:id])
    end

    def posting_update_params
        filtered_params =
            params.slice(
                :name,
                :open_date,
                :close_date,
                :intro_text,
                :custom_questions,
                :availability
            ).permit!
        if filtered_params[:custom_questions]
            filtered_params[:custom_questions] =
                filtered_params[:custom_questions].to_hash.deep_stringify_keys
        end
        filtered_params
    end

    def posting_insert_params
        filtered_params =
            params.slice(
                :session_id,
                :name,
                :open_date,
                :close_date,
                :intro_text,
                :custom_questions,
                :availability
            ).permit!
        filtered_params[:custom_questions] =
            filtered_params[:custom_questions].to_hash.deep_stringify_keys
        filtered_params
    end
end
