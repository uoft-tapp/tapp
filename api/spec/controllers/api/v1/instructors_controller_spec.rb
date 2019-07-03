# frozen_string_literal: true

RSpec.describe Api::V1::InstructorsController, type: :api do
    let!(:instructor) { FactoryBot.create(:instructor) }

    # This is the minimal set of attributes required to create a valid instructor.
    # As you add validations to Instructors, be sure to adjust the attributes
    # here.
    let(:valid_attributes) do
        {
            last_name: 'Wong',
            first_name: 'Julie',
            utorid: 'wongjulie305',
            email: 'julie.wong@mail.utoronto.ca'
        }
    end

    let(:index) do
        {
            route: '/instructors',
            table: Instructor,
            entry: instructor,
            factory: :instructor
        }
    end

    let(:create) do
        {
            route: '/instructors',
            table: Instructor,
        }
    end

    let(:update) do
        {
            route: "/instructors/#{instructor.id}",
            table: Instructor,
            entry: instructor,
            exclude: [:position_ids]
        }
    end

    describe 'GET /instructors' do
        it_behaves_like "generic index without nesting"
    end

    describe 'POST /instructors' do
        it_behaves_like "generic create that returns only the created record"
    end

    describe 'PUT /instructors/:id' do
        let(:update_attributes) do
            {
                last_name: valid_attributes[:first_name],
                first_name: valid_attributes[:last_name],
                email: valid_attributes[:email],
                position_ids: []
            }
        end
        it_behaves_like "generic update"
    end
end
