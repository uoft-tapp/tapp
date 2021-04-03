# frozen_string_literal: true

class PostingPosition < ApplicationRecord
    belongs_to :position
    belongs_to :posting

    validates :position_id, uniqueness: { scope: :posting }

    scope :by_session, lambda do |session_id|
        joins(:posting).where(posting: { session_id: session_id })
    end
end
