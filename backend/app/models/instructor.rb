# frozen_string_literal: true

class Instructor < ApplicationRecord
    has_and_belongs_to_many :positions

    validates_presence_of :last_name, :first_name, :utorid
    validates_uniqueness_of :utorid

    # Returns a formatted string displaying the instructor's contact information
    def contact_info
        if email?
            "#{first_name} #{last_name} <#{email}>"
        else
            "#{first_name} #{last_name}"
        end
    end
end

# == Schema Information
#
# Table name: instructors
#
#  id         :integer          not null, primary key
#  first_name :string
#  last_name  :string
#  email      :string
#  utorid     :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_instructors_on_utorid  (utorid) UNIQUE
#
