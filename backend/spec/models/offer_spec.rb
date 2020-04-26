# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Offer, type: :model do
    describe 'associations' do
        it { should belong_to(:assignment) }
    end
end

# == Schema Information
#
# Table name: offers
#
#  id                      :integer          not null, primary key
#  assignment_id           :integer          not null
#  offer_template          :string
#  offer_override_pdf      :string
#  first_name              :string
#  last_name               :string
#  email                   :string
#  position_code           :string
#  position_title          :string
#  position_start_date     :datetime
#  position_end_date       :datetime
#  first_time_ta           :boolean
#  instructor_contact_desc :string
#  pay_period_desc         :string
#  hours                   :float
#  installments            :integer
#  ta_coordinator_name     :string
#  ta_coordinator_email    :string
#  emailed_date            :datetime
#  signature               :string
#  accepted_date           :datetime
#  rejected_date           :datetime
#  withdrawn_date          :datetime
#  nag_count               :integer          default("0")
#  url_token               :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  status                  :integer          default("0"), not null
#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_url_token      (url_token)
#
