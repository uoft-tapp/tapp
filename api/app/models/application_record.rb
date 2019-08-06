# frozen_string_literal: true

# Base class of which every model inherits from.
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end
