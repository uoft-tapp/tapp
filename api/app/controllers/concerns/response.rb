# frozen_string_literal: true

# responds with json and HTTP code status
module Response
    def render_success(payload)
        payload = ActiveModelSerializers::SerializableResource.new(payload)
        render json: { status: 'success', message: '', payload: payload }
    end

    def render_error(message:, payload: {})
        render json: { status: 'error', message: message, payload: payload }
    end

    def render_on_condition(object:, condition:)
        if condition.call
            render_success object
        else
            render_error object.errors.full_messages.join('; ')
        end
    end
end
