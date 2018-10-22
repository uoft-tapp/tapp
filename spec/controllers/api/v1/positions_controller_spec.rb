# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V1::PositionsController, type: :api do
  let(:round) { FactoryBot.create(:round, :fall) }
  let!(:position) { FactoryBot.create(:position) }
  # This should return the minimal set of attributes required to create a valid
  # Position. As you add validations to Position, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) do
    {
      "openings": 25,
      "course_code": 'CSC100H1F',
      "round": round,
      "course_name": 'Introduction to Computer Science',
      "current_enrolment": 500,
      "duties": 'Lead labs',
      "qualifications": 'Well versed in Python',
      "hours": 54,
      "cap_enrolment": 500,
      "num_waitlisted": 100
    }
  end

  let(:invalid_attributes) do
    {
      "round": round,
      "course_name": 'Introduction to Computer Science',
      "current_enrolment": 500,
      "duties": 'Lead labs',
      "qualifications": 'Well versed in Python',
      "hours": 54,
      "cap_enrolment": 500,
      "num_waitlisted": 100,
      "openings": -10
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
      # expect(json).to eq(position.to_json)
      skip('add assertions to ensure json attributes are correct')
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
      # expect(json).to eq(position.to_json)
      skip('add assertions to ensure json attributes are correct')
    end
  end

  describe 'POST /positions' do
    # TODO
  end

  describe 'PUT /positions/:id' do
    # TODO
  end

  describe 'DELETE /positions/:id' do
    it 'destroys the requested position' do
      expect do
        delete "/api/v1/positions/#{position.id}", params: {}, session: valid_session
      end.to change(Position, :count).by(-1)
    end
  end
end
