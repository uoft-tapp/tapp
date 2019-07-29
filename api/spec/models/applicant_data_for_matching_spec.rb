# frozen_string_literal: true

describe ApplicantDataForMatching do
  it 'should have a valid factory' do
    application = FactoryBot.create(:application)
    applicant = FactoryBot.create(:applicant)
    a = FactoryBot.create(:applicant_data_for_matching, application: application, applicant: applicant)

    # TODO: Find out if we have to create the session as well. The data there seems to be missing
  end
end

