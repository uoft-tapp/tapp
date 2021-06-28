# frozen_string_literal: true

class Posting < ApplicationRecord
    POSTING_AVAILABILITY = %i[auto closed open].freeze
    belongs_to :session
    has_many :posting_positions, dependent: :destroy
    has_many :applications, dependent: :destroy

    has_secure_token :url_token
    enum availability: POSTING_AVAILABILITY

    validates :name, presence: true, uniqueness: { scope: :session }

    def open_status
        today = Time.now.in_time_zone('Eastern Time (US & Canada)').to_date
        range_start = open_date.to_date
        range_end = close_date.to_date
        (today >= range_start) && (today <= range_end)
    end
end
