# frozen_string_literal: true

# responds with json and HTTP code status
module Response
    def render_success(payload = {})
        # If an error is rendering already, we don't want to try to render
        # a success, so do a no-op instead
        unless performed?
            # active records have their own serializers, so use the
            # serializer if we are an active record. Otherwise, pass the
            # payload through.
            payload = ActiveModelSerializers::SerializableResource.new(payload) if payload
            render json: { status: 'success', message: '', payload: payload }
        end
    end

    def render_error(message:, payload: {}, error: nil)
        if error
            # if an actual error object was supplied, log the error before returning
            # it to the client.
            logger.warn do
                "ERROR: #{message}\n" +
                    ("TRACEBACK:\n\t" + error.backtrace.join("\n\t") if Rails.env.development?)
            end
        end
        render json: { status: 'error', message: message, payload: payload }
    end

    def render_on_condition(object:, condition:)
        if condition.call
            render_success object
        else
            render_error(message: object.errors.full_messages.join('; '), error: object.errors)
        end
    end
end
