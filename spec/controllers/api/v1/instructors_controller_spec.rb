# frozen_string_literal: true

RSpec.describe Api::V1::InstructorsController, type: :api do
  let!(:instructor) { FactoryBot.create(:instructor) }

  # This is the minimal set of attributes required to create a valid instructor.
  # As you add validations to Instructors, be sure to adjust the attributes
  # here.
  let(:valid_attributes) do
    {
      "last_name": 'Wong',
      "first_name": 'Julie',
      "utorid": 'wongjulie305',
      "email": 'julie.wong@mail.utoronto.ca'
    }
  end

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in the
  # InstructorsController. Be sure to keep this updated.
  let(:valid_session) { [] }

  describe 'GET /instructors' do
    before(:each) do
      get '/api/v1/instructors', params: {}, session: valid_session
    end

    it 'returns a success response' do
      expect(last_response).to be_successful
    end

    it 'returns the correct number of instructor' do
      expect(json.size).to eq(Instructor.count)
    end

    it 'returns the correct information for each instructor' do
      expect(last_response.body).to eq('[' + instructor.to_json + ']')
    end

    it 'returns the correct information for multiple instructor' do
      new_instructor = FactoryBot.create(:instructor)

      get 'api/v1/instructors', params: {}, session: valid_session

      expect(last_response.body).to eq('[' + instructor.to_json + ',' + new_instructor.to_json + ']')
      expect(JSON.parse(last_response.body).size).to eq(2)
    end
  end

  describe 'GET /instructors/:id' do
    before(:each) do
      get "/api/v1/instructors/#{instructor.id}", params: {}, session: valid_session
    end

    it 'returns a success response' do
      expect(last_response).to be_successful
    end

    it 'returns the correct information for each instructor' do
      expect(last_response.body).to eq(instructor.to_json)
    end
  end

  describe 'POST /instructors' do
    context 'with valid params' do
      it 'creates a new Instructor' do
        expect do
          post '/api/v1/instructors', valid_attributes, session: valid_session
        end.to change(Instructor, :count).by(1)
      end

      it 'returns a success response' do
        post '/api/v1/instructors', valid_attributes, session: valid_session
        expect(last_response).to be_successful
      end
    end
  end

  describe 'PUT /instructors/:id' do
    let(:new_attributes) { { last_name: 'Sousa' } }

    context 'when record exists' do
      context 'with valid params' do
        before(:each) do
          put "/api/v1/instructors/#{instructor.id}", new_attributes, session: valid_session
        end

        it 'updates the correct instructor' do
          instructor.reload
          expect(json['last_name']).to eq(new_attributes[:last_name])
        end

        it 'returns a success response' do
          expect(last_response).to be_successful
        end
      end
    end

    context 'when record does not exist' do
      it 'returns an error message' do
        put "/api/v1/instructors/#{Instructor.last.id + 1}", new_attributes, session: valid_session
        expect(json['message']).to eq("Couldn't find Instructor with 'id'=#{Instructor.last.id + 1}")
      end
    end
  end

  describe 'DELETE /instructors/:id' do
    it 'destroys the requested instructor' do
      expect do
        delete "api/v1/instructors/#{instructor.id}", params: {}, session: valid_session
      end.to change(Instructor, :count).by(-1)
    end

    it 'returns a success response' do
      delete "/api/v1/instructors/#{instructor.id}", params: {}, session: valid_session
      expect(last_response).to be_successful
    end
  end
end
