require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_mailbox/engine'
# require "action_text/engine"
require 'action_view/railtie'
# require "action_cable/engine"
# require "sprockets/railtie"
require 'rails/test_unit/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Tapp
    class Application < Rails::Application
        # Initialize configuration defaults for originally generated Rails version.
        config.load_defaults 6.0

        # Settings in config/environments/* take precedence over those specified here.
        # Application configuration can go into files in config/initializers
        # -- all .rb files in that directory are automatically loaded after loading
        # the framework and any gems in your application.

        # Only loads a smaller set of middleware suitable for API only apps.
        # Middleware like session, flash, cookies can be added back manually.
        # Skip views, helpers and assets when generating a new resource.
        config.api_only = true

        # Set up the the directories where persistent files are stored
        config.contract_template_dir =
            ENV.fetch('CONTRACT_TEMPLATE_DIR', '/storage/contract_templates')
                .presence || '/storage/contract_templates'

        # The required dependencies for ActiveStorage::Analyzer::ImageAnalyzer is not installed,
        # so we force all analyzers to be disabled
        config.active_storage.analyzers = []

        # This was added to use in the emails that send contract links.
        config.base_url =
            ENV.fetch('BASE_URL', 'localhost:3000').presence || 'localhost:3000'
        config.ta_coordinator_name =
            ENV.fetch('TA_COORDINATOR_NAME', 'TA Coordinator').presence ||
                'TA Coordinator'
        config.ta_coordinator_email =
            ENV.fetch('TA_COORDINATOR_EMAIL', 'tacoord@unknown.com').presence ||
                'tacoord@unknown.com'

        # email configuration
        email_server =
            ENV.fetch('EMAIL_SERVER', 'localhost').presence || 'localhost'
        email_port = ENV.fetch('EMAIL_PORT', 25).presence || 25
        config.action_mailer.raise_delivery_errors = true
        config.action_mailer.default_url_options = {
            host: '${confit.base_url}'
        }
        config.action_mailer.perform_caching = true
        config.action_mailer.delivery_method = :smtp
        config.action_mailer.smtp_settings = {
            address: email_server, port: email_port
        }

        # Authorization
        config.allow_basic_auth =
            %w[true 1].include?(ENV.fetch('ALLOW_BASIC_AUTH', '').downcase)
        config.always_admin =
            ENV.fetch('TAPP_ADMINS', '').split(',').map(&:strip)
    end
end
