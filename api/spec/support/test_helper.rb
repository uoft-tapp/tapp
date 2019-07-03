require "set"

shared_examples "generic index without nesting" do
    it 'returns a success response' do
        expect_get_success(routes[:index])
    end
    it 'returns the correct number of entries' do
        expect_correct_num_entries(routes[:index], routes[:table])
    end
    it 'returns the correct information for each entry' do
        expect_correct_single_entry(routes[:index], routes[:entry])
    end
    it 'returns the correct information for multiple entries' do
        expect_correct_multientry(
            routes[:index], routes[:entry], routes[:factory]
        )
    end
end

shared_examples "generic create that returns only the created record" do
    context 'with valid params' do
        it 'creates a new record' do
            expect_create_new_record(
                routes[:create][:route], 
                routes[:create][:params], 
                routes[:table]
            )
        end
        it 'returns a success response' do
            expect_post_success(
                routes[:create][:route], 
                routes[:create][:params]
            )
        end
    end
end

shared_examples "generic update" do
    context 'when record exists' do
        context 'with valid params' do
            it 'updates the correct record' do
                expect_update_record(
                    routes[:update][:route], 
                    routes[:update][:params], 
                    routes[:entry], 
                    routes[:update][:exclude]
                )
            end

            it 'returns a success response' do
                expect_put_success(
                    routes[:update][:route], 
                    routes[:update][:params]
                )
            end
        end
    end
    context 'when record does not exist' do
        it 'returns an error message' do
            update_nonexistent_record(
                routes[:table], routes[:update][:params]
            )
        end
    end
end