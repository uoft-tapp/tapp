# frozen_string_literal: true

module TransactionHandler
    extend ActiveSupport::Concern

    def start_transaction_and_rollback_on_exception
        ActiveRecord::Base.transaction do
            yield
        rescue StandardError => e
            begin
                render_error(message: e.message, error: e)
            rescue NoMethodError
                # if `start_transaction_and_rollback_on_exception` is executed
                # outside of a controller context, `render_error` will itself fail.
                # We aren't interested in its error. We want to bubble up the original
                # error that started it all.
                raise e
            end
        end
    end
end
