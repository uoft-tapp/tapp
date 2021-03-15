class PostingPosition < ApplicationRecord
    belongs_to :position
    belongs_to :posting

    validates :position_id, uniqueness: { scope: :posting }
end
