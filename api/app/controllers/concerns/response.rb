# frozen_string_literal: true

# responds with json and HTTP code status
module Response
    def render_success(payload)
        render json: { status: 'success', message: '', payload: payload }
    end
    def render_error(message, payload = {})
        render json: { status: 'error', message: message, payload: payload }
    end
    def invalid_id(table, params_key, payload = {})
        begin
            id = Integer(params[params_key])
            table.find(id)
            return false
        rescue ArgumentError 
            render_error("'#{params[params_key]}' is not a valid id.", payload)
            return true
        rescue ActiveRecord::RecordNotFound => e
            render_error(e.message, payload)
            return true
        end
    end
end
