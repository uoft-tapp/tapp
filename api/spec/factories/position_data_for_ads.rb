FactoryBot.define do
  factory :position_data_for_ad do
    position { nil }
    duties { "MyText" }
    qualifications { "MyText" }
    ad_hours_per_assignment { 1.5 }
    ad_num_assignments { 1 }
    ad_open_date { "2019-11-10 15:23:03" }
    ad_close_date { "2019-11-10 15:23:03" }
  end
end

# == Schema Information
#
# Table name: position_data_for_ads
#
#  id                      :integer          not null, primary key
#  position_id             :integer          not null
#  duties                  :text
#  qualifications          :text
#  ad_hours_per_assignment :float
#  ad_num_assignments      :integer
#  ad_open_date            :datetime
#  ad_close_date           :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_position_data_for_ads_on_position_id  (position_id)
#
