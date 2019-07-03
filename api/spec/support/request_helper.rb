# frozen_string_literal: true

module Requests
    module JsonHelpers
        def json
            JSON.parse(last_response.body, symbolize_names: true)
        end

        def valid_session
            return []
        end

        def expect_create_new_record(route, params, table)
            expect do
              post "/api/v1#{route}", valid_attributes, session: valid_session
            end.to change(table, :count).by(1)
        end

        def expect_no_new_record(route, params, table)
            expect do
              post "/api/v1#{route}", valid_attributes, session: valid_session
            end.to change(table, :count).by(0)
        end

        def expect_update_record(route, params, record)
            expect_put_success(route, params)
            record.reload
            result = json
            params.keys.each do |key|
                expect(result[:payload][key]).to eq(params[key])
            end
        end

        def update_nonexistent_record(table, params)
            non_id = table.last.id + 1
            put "/api/v1/#{table.to_s.downcase}s/#{non_id}", params, session: valid_session
            expect_no_record_found(table, non_id)
        end

        def expect_no_record_found(table, id)
            expect_error("Couldn't find #{table.to_s} with 'id'=#{id}")
        end

        def expect_post_success(route, params)
            post "/api/v1#{route}", params, session: valid_session
            expect_success
        end

        def expect_put_success(route, params)
            put "/api/v1#{route}", params, session: valid_session
            expect_success
        end

        def expect_post_error(route, params, message)
            post "/api/v1#{route}", params, session: valid_session
            expect_error(message)
        end

        def expect_put_error(route, params, message)
            put "/api/v1#{route}", params, session: valid_session
            expect_error(message)
        end

        def expect_success
            expect(json[:status]).to eq('success')
        end

        def expect_error(message)
            result = json
            expect(result[:status]).to eq('error')
            expect(result[:message]).to eq(message)
        end
    end
end
