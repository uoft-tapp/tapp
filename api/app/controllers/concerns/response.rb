# frozen_string_literal: true

# responds with json and HTTP code status
module Response
  def render_success(payload)
  	render json: { status: 'success', message: '', payload: payload }
  end
  def render_error(message, payload = {})
  	render json: { status: 'success', message: message, payload: payload }
  end
  def invalid_primary_key(table, params_key, payload = {})
  	begin
  	 	table.find(params[params_key])
  	 	return false
  	rescue ActiveRecord::RecordNotFound => e
  		render_error(e.message, payload)
  		return true
  	end
  end
end
