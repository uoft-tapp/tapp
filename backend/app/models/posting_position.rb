class PostingPosition < ApplicationRecord
    belongs_to :position
    belongs_to :posting
end
