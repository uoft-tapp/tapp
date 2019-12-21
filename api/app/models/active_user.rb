# frozen_string_literal: true

class ActiveUser < ApplicationRecord
    serialize :credentials, Hash
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
