# frozen_string_literal: true

module Requests
    module JsonHelpers
        def valid_session # defines a valid session
            return []
        end

        def json
            JSON.parse(last_response.body, symbolize_names: true)
        end

        def entries_to_json(entries)
            return entries.map do |entry|
                JSON.parse(entry.to_json, symbolize_names: true)
            end
        end

        def setup_routes(table, factory, data)
            routes = {
                table: table,
                factory: factory,
                entry: FactoryBot.create(factory),
            }
            data.keys.each do |item|
                if item != :index and item != :nested_index
                    data[item][:route] = data[item][:route].gsub(':id', 
                        routes[:entry].id.to_s)
                end
                routes[item] = data[item]
            end
            return routes
        end

        def factory_create(table, params, factory, extra = nil)
            record = table.find_by(params)
            if record
                return record
            else
                if extra
                    FactoryBot.create(factory, extra)
                else
                    FactoryBot.create(factory)
                end
            end
        end

        '''
            INDEX related functions
        '''
        def expect_correct_num_entries(route, table)
            expect_get_success(route)
            expect(json[:payload].size).to eq(table.count)
        end

        def expect_correct_single_entry(route, entry)
            expect_get_success(route)
            expect(json[:payload]).to eq(entries_to_json([entry]))
        end

        def expect_correct_multientry(route, record, type)
            new_record = FactoryBot.create(type)
            expect_get_success(route)
            result = json
            expect(result[:payload]).to eq(entries_to_json([record,new_record]))
            expect(result[:payload].size).to eq(2)
        end

        '''
            CREATE related functions
        '''
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

        '''
            UPDATE related functions
        '''
        def expect_update_record(route, params, record, excluded)
            expect_put_success(route, params)
            record.reload
            result = json
            params.keys.each do |key|
                if not excluded.include?(key)
                    expect(result[:payload][key]).to eq(params[key])
                end
            end
        end

        def update_nonexistent_record(table, params)
            non_id = table.last.id + 1
            put "/api/v1/#{table.to_s.downcase}s/#{non_id}", params, session: valid_session
            expect_no_record_found(table, non_id)
        end

        '''
            REQUEST-related EXPECT functions
        '''
        def expect_get_success(route)
            get "/api/v1#{route}", session: valid_session
            expect_success
        end

        def expect_get_error(route, message)
            get "/api/v1#{route}", session: valid_session
            expect_error(message)
        end

        def expect_post_success(route, params)
            post "/api/v1#{route}", params, session: valid_session
            expect_success
        end

        def expect_post_error(route, params, message)
            post "/api/v1#{route}", params, session: valid_session
            expect_error(message)
        end

        def expect_put_success(route, params)
            put "/api/v1#{route}", params, session: valid_session
            expect_success
        end

        def expect_put_error(route, params, message)
            put "/api/v1#{route}", params, session: valid_session
            expect_error(message)
        end

        '''
            miscellaneous EXPECT functions
        '''
        def expect_success
            expect(json[:status]).to eq('success')
        end

        def expect_error(message)
            result = json
            expect(result[:status]).to eq('error')
            expect(result[:message]).to eq(message)
        end

        def expect_no_record_found(table, id)
            expect_error("Couldn't find #{table.to_s} with 'id'=#{id}")
        end
    end
end
