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
            if payload
                payload =
                    ActiveModelSerializers::SerializableResource.new(payload)
            end
            render json: { status: 'success', message: '', payload: payload }
        end
    end

    def render_error(message:, payload: {}, error: nil)
        # if an actual error object was supplied, log the error before returning
        # it to the client.

        if error
            begin
                logger.warn do
                    bc = ActiveSupport::BacktraceCleaner.new
                    bc.add_filter { |line| line.gsub(Rails.root.to_s, '') } # strip the Rails.root prefix
                    bc.add_silencer { |line| line =~ /puma|gems/ } # skip any lines from puma or rubygems

                    red_start = ''
                    yellow_start = ''
                    color_end = ''
                    if Rails.env.development?
                        # Format the traceback message to be in color if we're in dev mode.
                        # 31m is red.
                        red_start = "\e[31m"
                        yellow_start = "\e[33m"
                        color_end = "\e[0m"
                    end
                    red_start +
                        "ERROR: #{message}\n#{
                            red_start + error.message + "\n" if error
                        }" + red_start + "Traceback:\n\t" + yellow_start +
                        bc.clean(error.backtrace).join("\n\t" + yellow_start) +
                        color_end
                end
                # rubocop:disable Lint/SuppressedException
            rescue StandardError
            end
            # rubocop:enable Lint/SuppressedException
        end
        render json: { status: 'error', message: message, payload: payload }
    end

    def render_on_condition(object:, condition:, error_message: nil)
        if condition.call
            render_success object
        else
            render_error(
                message:
                    if error_message?
                        "#{error_message}\nDetails: #{
                            object.errors.full_messages.join('; ')
                        }"
                    else
                        object.errors.full_messages.join('; ')
                    end,
                error: object.errors
            )
        end
    rescue StandardError => e
        render_error message: error_message || e.message, error: e
    end
end
