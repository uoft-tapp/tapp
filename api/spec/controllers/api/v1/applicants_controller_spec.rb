# frozen_string_literal: true

RSpec.describe Api::V1::ApplicantsController, type: :api do
    let!(:applicant) { FactoryBot.create(:applicant) }

    # This is the minimal set of attributes required to create a valid applicant.
    # As you add validations to Applicants, be sure to adjust the attributes
    # here.
    let(:valid_attributes) do
        {
          "last_name": 'Loblaw',
          "first_name": 'Bob',
          "utorid": 'blahblah1',
          "student_number": "1111222333",
          "email": 'bobloblaw@mail.utoronto.ca'
        }
    end

    describe 'POST /applicants' do
        context 'with valid params' do
            it 'creates a new Applicant' do
                expect_create_new_record('/applicants', valid_attributes, Applicant)
            end

            it 'returns a success response' do
                expect_post_success('/applicants', valid_attributes)
            end
        end
    end

    describe 'PUT /applicants/:id' do
        context 'when record exists' do
            context 'with valid params' do
                it 'updates the correct applicant' do
                    expect_update_record("/applicants/#{applicant.id}", valid_attributes, applicant)
                end

                it 'returns a success response' do
                    expect_put_success("/applicants/#{applicant.id}", valid_attributes)
                end
            end
        end

        context 'when record does not exist' do
            it 'returns an error message' do
                update_nonexistent_record(Applicant, valid_attributes)
            end
        end
    end
end