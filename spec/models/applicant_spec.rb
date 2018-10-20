# frozen_string_literal: true

require 'rails_helper'

describe Applicant do
  it 'has a valid factory' do
    k = Factory.create(:applicant, :full)
    puts k
  end
end
# == Schema Information
#
# Table name: applicants
#
#  id              :bigint(8)        not null, primary key
#  address         :text
#  commentary      :text
#  dept            :string
#  email           :string
#  first_name      :string
#  is_full_time    :boolean
#  is_grad_student :boolean
#  last_name       :string
#  phone           :string
#  student_number  :string
#  utorid          :string
#  year_in_program :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_applicants_on_student_number  (student_number) UNIQUE
#  index_applicants_on_utorid          (utorid) UNIQUE
#
