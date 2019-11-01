# frozen_string_literal: true

# responds with json and HTTP code status
module Response
    def render_success(payload)
        render json: { status: 'success', message: '', payload: payload }
    end

    def render_error(message, payload = {})
        render json: { status: 'error', message: message, payload: payload }
    end

    def invalid_id?(table, params_key, payload = {})
        table.find(params[param_key])
        false
    rescue ArgumentError
        render_error("'#{params[params_key]}' is not a valid id.", payload)
        true
    rescue ActiveRecord::RecordNotFound => e
        render_error(e.message, payload)
        true
    end
end
