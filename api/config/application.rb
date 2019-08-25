# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Tapp
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # Create a new logger that writes to stdout.
    logger = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.log_tags = %i[subdomain uuid]
    config.logger = ActiveSupport::TaggedLogging.new(logger)
    config.autoload_paths += %W(#{config.root}/docs)
    
    begin
        # Stop the `Cannot render console from ...` error messages in the console
        config.web_console.whiny_requests = false
    rescue
    end

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
