# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assignment, type: :model do
    describe 'associations' do
        it { should have_many(:offers) }
        it { should have_many(:wage_chunks) }
        it { should belong_to(:applicant) }
        it { should belong_to(:position) }
    end

    describe 'validations' do
        subject { build(:assignment) }
        it do
            should validate_uniqueness_of(:applicant_id).scoped_to(:position_id)
        end
    end
end

# == Schema Information
#
# Table name: assignments
#
#  id                  :integer          not null, primary key
#  position_id         :integer          not null
#  applicant_id        :integer          not null
#  start_date          :datetime
#  end_date            :datetime
#  note                :text
#  offer_override_pdf  :string
#  active_offer_status :integer          default("0"), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  active_offer_id     :integer
#
# Indexes
#
#  index_assignments_on_active_offer_id               (active_offer_id)
#  index_assignments_on_applicant_id                  (applicant_id)
#  index_assignments_on_position_id                   (position_id)
#  index_assignments_on_position_id_and_applicant_id  (position_id,applicant_id) UNIQUE
#
