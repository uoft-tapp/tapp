# frozen_string_literal: true

class ApplicantSerializer < ActiveModel::Serializer
    attributes :id,
               :first_name,
               :last_name,
               :email,
               :phone,
               :utorid,
               :student_number
end
