# frozen_string_literal: true

# responds with json and HTTP code status
module Response
  def json_response(object, status = :ok)
    render json: object, status: status
  end
end
