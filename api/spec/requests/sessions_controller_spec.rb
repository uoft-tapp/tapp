# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::SessionsController do
    let(:valid_attributes) do
        {
            "start_date": Time.zone.now,
            "end_date": Time.zone.now + 3.days,
            "name": 'Fall 2019 Session',
            "rate1": 20.00
        }
    end

    describe 'GET /sessions' do
        it 'returns all Sessions' do
            session = create(:session, :fall)
            get '/api/v1/sessions'
            expect(response.status).to eq(200)
            payload = JSON.parse(response.body)['payload']
            expect(payload).to be_an_instance_of(Array)
            expect(payload.first).to eq(session.as_json(only: %i[end_date id start_date name]))
        end
    end

    describe 'POST /sessions' do
        context 'with a new Session' do
            context 'with valid attributes' do
                before(:each) do
                    expect(Session.count).to eq(0)
                    post '/api/v1/sessions', params: valid_attributes
                end

                it 'creates a new session' do
                    expect(Session.count).to eq(1)
                end

                it 'returns a successful response' do
                    expect(response.status).to eq(200)
                end
            end
        end

        context 'with existing Session' do
            let!(:session) { create(:session, :winter) }
            it 'should update existing' do
                expect(Session.count).to eq(1)
                session = Session.first
                session.start_date = session.start_date - 1.day
                post '/api/v1/sessions', params: session.as_json
                expect(Session.count).to eq(1)
                expect(Session.first.start_date).to eq(session.start_date)
            end
        end
    end

    describe 'POST /sessions/delete' do
        let!(:session) { create(:session, :summer) }

        before(:each) do
            expect(Session.count).to eq(1)
        end

        context 'with a valid Session' do
            before(:each) do
                post '/api/v1/sessions/delete', params: { id: session.id }
            end

            it 'creates a deletes the Session' do
                expect(Session.count).to eq(0)
            end

            it 'returns a successful response' do
                expect(response.status).to eq(200)
            end
        end

        context 'with an invalid Session' do
            before(:each) do
                post '/api/v1/sessions/delete', params: { id: -1 }
            end

            it 'does not delete any Session' do
                expect(Session.count).to eq(1)
            end

            it 'returns a successful response' do
                expect(response.status).to eq(200)
            end

            it 'returns an error message' do
                body = JSON.parse(response.body)
                expect(body['message']).to include("Couldn't find Session")
            end
        end
    end
end
