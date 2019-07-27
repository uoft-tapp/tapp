# frozen_string_literal: true

RSpec.describe Api::V1::PositionsController, type: :api do
    # This is the minimal set of attributes required to create a valid
    # Position. As you add validations to Position, be sure to
    # adjust the attributes here as well.
    let!(:session) { FactoryBot.create(:session, :winter) }
    let(:valid_attributes) do
        year = Time.now.year
        {
            course_code: 'CSC108H1F',
            position_title: 'Introduction to Computer Science',
            position_type: 'type name',
            est_start_date: Time.new(year, 9, 1),
            est_end_date: Time.new(year, 12, 31),
            est_hours_per_assignment: 10,
            session_id: session.id,
        }
    end

    let(:routes) do
        setup_routes(Position, :position, 
        {
            nested_index: '/sessions/:session_id/positions',
            add: {
                route: '/sessions/:session_id/positions',
                params: valid_attributes,
            },
            update: {
                route: '/positions',
                params: valid_attributes,
                exclude: []
            }
            
        })
    end

    describe 'GET /sessions/:session_id/positions' do
    end

    describe 'POST /sessions/:session_id/positions (insert)' do
    end

    describe 'POST /positions (update)' do
    end

end
