# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Instructor, type: :model do
    describe 'associations' do
        it { should have_and_belong_to_many(:positions) }
    end

    describe 'validations' do
        it { should validate_presence_of(:last_name) }
        it { should validate_presence_of(:first_name) }
        it { should validate_presence_of(:utorid) }
        it { should validate_presence_of(:email) }
    end

    describe 'uniqueness of utorid' do
        subject { build(:instructor) }
        it { should validate_uniqueness_of(:utorid) }
    end
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
