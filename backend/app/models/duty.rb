# frozen_string_literal: true

class Duty < ApplicationRecord
    belongs_to :ddah
end
# == Schema Information
#
# Table name: duties
#
#  id          :integer          not null, primary key
#  ddah_id     :integer
#  description :string
#  hours       :float
#  order       :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_duties_on_ddah_id  (ddah_id)
#

#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_url_token      (url_token)
#
