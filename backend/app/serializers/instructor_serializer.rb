# frozen_string_literal: true

class InstructorSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email, :utorid
end
