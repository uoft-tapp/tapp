# frozen_string_literal: true

# A class representing an application of an applicant.
class Application < ApplicationRecord
end

# == Schema Information
#
# Table name: applications
#
#  id         :bigint(8)        not null, primary key
#  comments   :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
