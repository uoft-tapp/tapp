class Posting < ApplicationRecord
    belongs_to :session
    has_many :posting_positions
end
