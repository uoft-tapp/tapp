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
            "student_number": 1_111_222_333,
            "email": 'bobloblaw@mail.utoronto.ca'
        }
    end

    # This should return the minimal set of values that should be in the session
    # in order to pass any filters (e.g. authentication) defined in the
    # ApplicantsController. Be sure to keep this updated.
    let(:valid_session) { [] }

    describe 'POST /applicants' do
        context 'with valid params' do
            it 'creates a new Applicant' do
                expect do
                    post '/api/v1/applicants', valid_attributes, session: valid_session
                end.to change(Applicant, :count).by(1)
            end

            it 'returns a success response' do
                post '/api/v1/applicants', valid_attributes, session: valid_session
                expect(last_response).to be_successful
            end
        end
    end

    describe 'PUT /applicants/:id' do
        let(:new_attributes) { { last_name: 'Bobloblaw' } }

        context 'when record exists' do
            context 'with valid params' do
                before(:each) do
                    put "/api/v1/applicants/#{applicant.id}", new_attributes, session: valid_session
                end

                it 'updates the correct applicant' do
                    applicant.reload
                    expect(json['last_name']).to eq(new_attributes[:last_name])
                end

                it 'returns a success response' do
                    expect(last_response).to be_successful
                end
            end
        end

        context 'when record does not exist' do
            it 'returns an error message' do
                put "/api/v1/applicants/#{Applicant.last.id + 1}", new_attributes, session: valid_session
                expect(json['message']).to eq("Couldn't find Applicant with 'id'=#{Applicant.last.id + 1}")
            end
        end
    end
end
