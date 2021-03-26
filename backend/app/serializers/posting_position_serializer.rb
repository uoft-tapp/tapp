# frozen_string_literal: true

class PostingPositionSerializer < ActiveModel::Serializer
    attributes :position_id, :posting_id, :num_positions, :hours
end
