# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActiveUser, type: :model do
    describe 'methods' do
        it { should serialize(:credentials) }
    end
end

# == Schema Information
#
# Table name: active_users
#
#  id          :integer          not null, primary key
#  credentials :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
