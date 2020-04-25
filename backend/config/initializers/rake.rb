# frozen_string_literal: true

require 'rake'

if Rake::Task.tasks.empty? && !Rails.env.production?
    Tapp::Application.load_tasks
end
