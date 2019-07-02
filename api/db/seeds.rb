# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.

def request(action, path, params = nil)
    '''
    action: :get, :post, :put, :delete
    path: no need to include "/api/v1" portion of the route
    '''
    env = { method: action, params: params }
    mock_session = Rack::MockSession.new(Rails.application)
    session = Rack::Test::Session.new(mock_session)
    session.request("/api/v1#{path}", env)
    return mock_session.last_response.body
end

def readJson(file)
    seed_data_dir = Rails.root.join('db', 'seed')
    begin
        data = File.read("#{seed_data_dir}#{file}")
        return JSON.parse(data)
    rescue Errno::ENOENT => e
        puts e
        return []
    rescue JSON::ParserError 
        puts "#{seed_data_dir}#{file} is not a valid JSON file."
        return []
    end
end
