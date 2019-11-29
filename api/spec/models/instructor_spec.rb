# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Instructor, type: :model do
    pending "add some examples to (or delete) #{__FILE__}"
end

# == Schema Information
#
# Table name: instructors
#
#  id         :integer          not null, primary key
#  first_name :string           not null
#  last_name  :string           not null
#  email      :string           not null
#  utorid     :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_instructors_on_utorid  (utorid) UNIQUE
#
