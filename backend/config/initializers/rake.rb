# frozen_string_literal: true

require 'rake'

Tapp::Application.load_tasks if Rake::Task.tasks.empty? && !Rails.env.production?