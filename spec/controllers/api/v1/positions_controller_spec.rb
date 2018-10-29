# frozen_string_literal: true

RSpec.describe Api::V1::PositionsController, type: :api do
  let(:round) { FactoryBot.create(:round, :fall) }
  let!(:position) { FactoryBot.create(:position) }

  # This is the minimal set of attributes required to create a valid
  # Position. As you add validations to Position, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) do
    {
      "openings": 25,
      "round_id": round.id,
      "course_code": 'CSC108H1F'
    }
  end

  let(:invalid_attributes) do
    {
      "openings": -10,
      "round_id": round.id,
      "course_code": 'CSC108H1F'
    }
  end

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in
  # PositionsController. Be sure to keep this updated too.
  let(:valid_session) { {} }

  describe 'GET /positions' do
    before(:each) do
      get '/api/v1/positions', params: {}, session: valid_session
    end

    it 'returns a success response' do
      expect(last_response).to be_successful
    end

    it 'returns the correct number of positions' do
      expect(json.size).to eq(Position.count)
    end

    it 'returns the correct information for each position' do
      expect(last_response.body).to eq('[' + position.to_json + ']')
    end
  end

  describe 'GET /positions/:id' do
    before(:each) do
      get "/api/v1/positions/#{position.id}", params: {}, session: valid_session
    end

    it 'returns a success response' do
      expect(last_response).to be_successful
    end

    it 'returns the correct information for each position' do
      expect(last_response.body).to eq(position.to_json)
    end
  end

  describe 'POST /positions' do
    context 'with valid params' do
      it 'creates a new Position' do
        expect do
          post '/api/v1/positions/', valid_attributes, session: valid_session
        end.to change(Position, :count).by(1)
      end

      it 'returns a success response' do
        post '/api/v1/positions/', valid_attributes, session: valid_session
        expect(last_response).to be_successful
      end
    end

    context 'with invalid params' do
      it 'does not create a new Position' do
        expect do
          post '/api/v1/positions/', invalid_attributes, session: valid_session
        end.to change(Position, :count).by(0)
      end

      it 'returns an appropriate message' do
        post '/api/v1/positions/', invalid_attributes, session: valid_session
        expect(json['openings']).to eq(['must be greater than 0'])
      end
    end
  end

  describe 'PUT /positions/:id' do
    let(:new_attributes) { { qualifications: 'New and updated qualifications' } }

    context 'when record exists' do
      context 'with valid params' do
        before(:each) do
          put "/api/v1/positions/#{position.id}", new_attributes, session: valid_session
        end

        it 'updates the requested position' do
          position.reload
          expect(json['qualifications']).to eq(new_attributes[:qualifications])
        end

        it 'returns a success response' do
          expect(last_response).to be_successful
        end
      end

      context 'with invalid params' do
        it 'returns an error message' do
          put "/api/v1/positions/#{position.id}", invalid_attributes, session: valid_session
          expect(json['openings']).to eq(['must be greater than 0'])
        end
      end
    end

    context 'when record does not exist' do
      it 'returns an error message' do
        put "/api/v1/positions/#{position.id + 1}", new_attributes, session: valid_session
        expect(json['message']).to eq("Couldn't find Position with 'id'=#{position.id + 1}")
      end
    end
  end

  describe 'DELETE /positions/:id' do
    it 'destroys the requested position' do
      expect do
        delete "/api/v1/positions/#{position.id}", params: {}, session: valid_session
      end.to change(Position, :count).by(-1)
    end

    it 'returns a success response' do
      delete "/api/v1/positions/#{position.id}", params: {}, session: valid_session
      expect(last_response).to be_successful
    end
  end
end
