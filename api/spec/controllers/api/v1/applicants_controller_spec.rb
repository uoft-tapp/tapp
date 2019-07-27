# frozen_string_literal: true

RSpec.describe Api::V1::ApplicantsController, type: :api do
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

    let(:routes) do
        setup_routes(Applicant, :applicant, 
        {
            index: '/applicants',
            create: {
                route: '/applicants',
                params: valid_attributes
            },
            update: {
                route: '/applicants',
                params: valid_attributes,
                exclude: [:id]
            }
            
        })
    end

    describe 'GET /applicants' do
        it_behaves_like "generic index without nesting"
    end

    describe 'POST /applicants (insert)' do
        it_behaves_like "generic create that returns only the created record"
    end

    describe 'POST /applicants (update)' do
        it_behaves_like "generic update"
    end
end