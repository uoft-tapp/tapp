# frozen_string_literal: true

module TransactionHandler
    extend ActiveSupport::Concern

    def start_transaction_and_rollback_on_exception
        ActiveRecord::Base.transaction do
            yield
        rescue => e
            render_error(message: e.message)
        end
    end
end
