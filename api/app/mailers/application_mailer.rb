# frozen_string_literal: true

# Default class for mailing to an address
class ApplicationMailer < ActionMailer::Base
    default from: 'from@example.com'
    layout 'mailer'
end
