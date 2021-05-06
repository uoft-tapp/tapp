# frozen_string_literal: true

class Posting < ApplicationRecord
    POSTING_AVAILABILITY = %i[auto closed open].freeze
    belongs_to :session
    has_many :posting_positions, dependent: :destroy
    has_many :applications, dependent: :destroy

    has_secure_token :url_token
    enum availability: POSTING_AVAILABILITY

    validates :name, presence: true, uniqueness: { scope: :session }
end
