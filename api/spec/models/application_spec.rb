# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Application, type: :model do
    describe 'associations' do
        it { should have_many(:position_preferences) }
        it { should have_many(:positions).through(:position_preferences) }
        it { should belong_to(:applicant) }
        it { should belong_to(:session) }
    end
end

# == Schema Information
#
# Table name: applications
#
#  id           :integer          not null, primary key
#  session_id   :integer          not null
#  applicant_id :integer          not null
#  comments     :text
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_applications_on_applicant_id  (applicant_id)
#  index_applications_on_session_id    (session_id)
#
