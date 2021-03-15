class Posting < ApplicationRecord
    POSTING_STATUS = %i[inactive active]
    belongs_to :session
    has_many :posting_positions
    has_many :applications

    has_secure_token :url_token
    enum status: POSTING_STATUS

    validates :name, presence: true, uniqueness: { scope: :session }
end
