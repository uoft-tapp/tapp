require "set"

shared_examples "generic index without nesting" do
    it 'returns a success response' do
        expect_get_success(index[:route])
    end
    it 'returns the correct number of entries' do
        expect_correct_num_entries(index[:route], index[:table])
    end
    it 'returns the correct information for each entry' do
        expect_correct_single_entry(index[:route], index[:entry])
    end
    it 'returns the correct information for multiple entries' do
        expect_correct_multientry(index[:route], index[:entry], index[:factory])
    end
end

shared_examples "generic create that returns only the created record" do
    context 'with valid params' do
        it 'creates a new record' do
            expect_create_new_record(create[:route], valid_attributes, create[:table])
        end
        it 'returns a success response' do
            expect_post_success(create[:route], valid_attributes)
        end
    end
end

shared_examples "generic update" do
    context 'when record exists' do
        context 'with valid params' do
            it 'updates the correct record' do
                expect_update_record(update[:route], 
                    update_attributes, update[:entry], update[:exclude])
            end

            it 'returns a success response' do
                expect_put_success(update[:route], update_attributes)
            end
        end
    end
    context 'when record does not exist' do
        it 'returns an error message' do
            update_nonexistent_record(update[:table], update_attributes)
        end
    end
end