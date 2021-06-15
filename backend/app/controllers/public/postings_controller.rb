# frozen_string_literal: true

# `ApplicationControler` is set to always return JSON. In this controller we want to return
# html and pdf, so we subclass ActionController directly
class Public::PostingsController < ActionController::Base
    include Response
    include TransactionHandler

    # /public/postings/<id>
    def show
        return unless valid_posting?(url_token: show_params[:id])

        active_user = ActiveUserService.active_user request
        posting_service = PostingService.new(posting: @posting)

        render_success(
            {
                survey: posting_service.survey,
                prefilled_data: posting_service.prefill(user: active_user)
            }
        )
    end

    # /public/postings/<id>/submit
    def submit
        return unless valid_posting?(url_token: submit_params[:posting_id])

        active_user = ActiveUserService.active_user request
        posting_service = PostingService.new(posting: @posting)
        posting_service.process_answers(
            user: active_user, answers: submit_params[:answers]
        )
        posting_service.save_answers!

        render_success posting_service.prefill(user: active_user)
    rescue StandardError => e
        render_error(message: 'Error submitting application', error: e)
    end

    private

    def show_params
        params.permit(:id, :format)
    end

    def submit_params
        params.slice(:posting_id, :answers).permit!
    end

    # tests to see if a valid posting exists corresponding to the specified
    # url token. Will render a 404 if not found. Should be used as
    #    return unless valid_posting?(...)
    #
    # Stores the found posting in `@posting`
    def valid_posting?(url_token: nil)
        posting = Posting.find_by(url_token: url_token)

        unless posting
            render status: 404,
                   inline: "No posting found with id='#{url_token}'"
            return false
        end

        @posting = posting
    end
end
