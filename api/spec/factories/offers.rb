FactoryBot.define do
  factory :offer do
    assignment { nil }
    offer_template { "MyString" }
    offer_override_pdf { "MyString" }
    first_name { "MyString" }
    last_name { "MyString" }
    email { "MyString" }
    position_code { "MyString" }
    position_title { "MyString" }
    position_start_date { "2019-11-10 15:16:25" }
    position_end_date { "2019-11-10 15:16:25" }
    first_time_ta { false }
    instructor_contact_desc { "MyString" }
    pay_period_desc { "MyString" }
    installments { 1 }
    ta_coordinator_name { "MyString" }
    ta_coordinator_email { "MyString" }
    emailed_date { "2019-11-10 15:16:25" }
    signature { "MyString" }
    accepted_date { "2019-11-10 15:16:25" }
    rejected_date { "2019-11-10 15:16:25" }
    withdrawn_date { "2019-11-10 15:16:25" }
    nag_count { 1 }
    url_token { "MyString" }
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
