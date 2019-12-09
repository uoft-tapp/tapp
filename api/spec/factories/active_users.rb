# frozen_string_literal: true

FactoryBot.define do
    factory :active_user do
        credentials { 'MyText' }
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
