# frozen_string_literal: true

# This module is responsible for generating the yml for the API documentation
# It auto generates the documentation for routes structured routes and allows
# customized routes to be documented and generated as part of the yaml file
module RouteAnalyzer
    include FakeData
    include SeedsHandler
    def all_routes
        routes = Rails.application.routes.routes.map do |route|
            named_routes = Rails.application.routes.named_routes
            {
                path: route.path.spec.to_s.sub('(.:format)', '').sub('/api/v1', ''),
                name: route.name,
                controller: route.defaults[:controller],
                action: route.defaults[:action] ? route.defaults[:action].to_sym : nil,
                method: route.name ? named_routes[route.name].verb.downcase.to_sym : nil
            }
        end
        routes, schemas = filter_controller_routes(routes)
        routes = add_details(routes)
        [get_unique_routes(routes), schemas]
    end

    def update_route_documentation(routes, data)
        ind_map = key_to_index(routes)
        data.keys.each do |key|
            if ind_map.key?(key)
                label, ind = ind_map[key]
                routes[label][ind][:summary] = data[key][:summary] if data[key][:summary]
                routes[label][ind][:request] = data[key][:request] if data[key][:request]
                routes[label][ind][:response] = data[key][:response] if data[key][:response]
            else
                all_keys = ind_map.keys.map do |route_name|
                    label, ind = ind_map[route_name]
                    "#{routes[label][ind][:method]} #{routes[label][ind][:path]}, "\
                    "name: #{route_name}"
                end
                abort("#{key} is not a valid route name. The following are the "\
                    "valid route names:\n#{all_keys.join("\n")}")
            end
        end
    end

    def key_to_index(routes)
        ind_map = {}
        routes.keys.each do |key|
            routes[key].each_with_index do |entry, j|
                ind_map[entry[:name].to_s.sub('api_v1_', '').to_sym] = [key, j]
            end
        end
        ind_map
    end

    def get_unique_routes(routes)
        unique_routes = {}
        routes.each do |item|
            unique_routes[item[:path]] = [] unless unique_routes.key?(item[:path])
            unique_routes[item[:path]].push(item)
        end
        unique_routes
    end

    def filter_controller_routes(routes)
        schemas = {}
        routes = routes.select do |route|
            keeping = route[:controller] ? !route[:controller].scan('api/v1/').empty? : false
            if keeping
                route[:controller] = route[:controller].sub('api/v1/', '').to_sym
                schemas = setup_schemas(route[:controller], schemas)
            end
            keeping
        end
        [routes, schemas]
    end

    def setup_schemas(controller, schemas)
        table = controller_to_title(controller)
        unless schemas.key?(controller)
            schemas[controller] = {
                title: "JSON for #{table}",
                data: controller_attributes(controller),
                required: []
            }
            schemas[controller_to_input(controller)] = {
                title: "JSON for creating #{table}",
                data: schemas[controller][:data].except(:created_at, :updated_at),
                required: index_on(controller).map { |i| id_name(i) }
            }
        end
        schemas
    end

    def controller_to_title(controller)
        controller.to_s[0..-2].tr('_', ' ').titleize
    end

    def add_details(routes)
        routes.map do |entry|
            controller = entry[:controller].to_s[0..-2]
            entry[:request] = { params: {}, required: min_params(entry) }
            entry[:response] = { params: {}, required: [] }
            entry[:parameters] = format_required_input(entry[:request][:required])
            entry[:path] = entry[:path].gsub(/(\:)([\w]+)/, '{\2}')
            case entry[:action]
            when :create
                given = get_given_from_required(entry[:request][:required])
                entry[:summary] = "Create new #{controller}#{given} or update #{controller} with id"
                entry[:request][:params] = controller_to_input(entry[:controller])
                entry[:response][:array] = true if array_result(entry[:path])
                entry[:response][:params] = entry[:controller]
            when :index
                entry[:summary] = "Show all #{controller}s"
                if entry[:request][:required].length.positive?
                    entry[:summary] += " given #{entry[:request][:required].join(',')}"
                end
                entry[:request][:params] = format_required_input(entry[:request][:required])
                entry[:response][:array] = true
                entry[:response][:params] = entry[:controller]
            when :delete
                entry[:summary] = "Delete #{controller} given id"
                entry[:request][:required] = [:id]
                entry[:request][:params] = {
                    id: :integer
                }
                entry[:response][:params] = entry[:controller]
            end
            entry
        end
    end

    def get_given_from_required(required)
        required.length.positive? ? " with given #{required.join(',')}" : ''
    end

    def format_required_input(required)
        data = {}
        required.each do |item|
            if item.to_s.scan(/(_id)/).length.positive?
                data[item] = :integer
            else
                return {}
            end
        end
        data
    end

    def routes_documented?(routes)
        route_num = 0
        incomplete = []
        completed = {}
        routes.keys.each do |key|
            routes[key].each do |route|
                if !route[:method] || route[:name] == 'api_v1'
                    incomplete.push("#{route_num + 1}. #{route[:path]}, action: :#{route[:action]}" \
                        "\n\tPlease set an unique for this route in /config/routes.rb using:" \
                        "\n\t\t get/post {route}, action: {action}, as: {name}")
                else
                    label = "#{route_num + 1}. #{route[:method]} #{route[:path]}" \
                        ", name: #{route[:name].sub('api_v1_', '')}\n\t"
                    route[:summary] = route[:summary] ? route[:summary].strip : ''
                    if !route[:summary].length.positive?
                        incomplete.push("#{label}No summary set for this route")
                    elsif route[:response][:params] == {}
                        incomplete.push("#{label}No response set for this route")
                    else
                        completed[key] = [] unless completed.key?(key)
                        completed[key].push(route)
                    end
                end
                route_num += 1
            end
        end
        puts incomplete.length.positive? ? "#{incomplete.join("\n\n")}\n\n" : ''
        puts "API Documentation: #{incomplete.length} todo, " \
            "#{route_num - incomplete.length} completed, #{route_num} total."
        [!incomplete.length.positive?, completed]
    end

    def controller_attributes(controller)
        case controller
        when :applicants
            model_attributes(Applicant)
        when :applications
            application = model_attributes(Application)
            application.merge(model_attributes(ApplicantDataForMatching))
            application
        when :assignments
            model_attributes(Assignment)
        when :instructors
            model_attributes(Instructor)
        when :offers
            model_attributes(Offer)
        when :position_preferences
            model_attributes(PositionPreference)
        when :position_templates
            model_attributes(PositionTemplate)
        when :positions
            position = model_attributes(Position)
            position.merge(model_attributes(PositionDataForMatching))
            position.merge(model_attributes(PositionDataForAd))
            position[:instructor_ids] = [:integer]
            position
        when :reporting_tags
            model_attributes(ReportingTag)
        when :sessions
            model_attributes(Session)
        when :wage_chunks
            model_attributes(WageChunk)
        else
            []
        end
    end

    def format_routes(path, route, schemas)
        data = {
            name: path,
            value: []
        }
        route.each_with_index do |entry, i|
            if i.zero? && entry[:parameters].length.positive?
                data[:value].push(
                    name: 'parameters',
                    value: format_parameters(entry)
                )
            end
            value_entry = {
                name: entry[:method].to_s,
                value: [
                    {
                        name: 'tags',
                        value: "- #{controller_to_title(entry[:controller])}",
                        no_quotes: true
                    },
                    {
                        name: 'summary',
                        value: entry[:summary] || 'TODO'
                    }
                ]
            }
            if entry[:request][:params] != {}
                if entry[:method] == :post
                    value_entry[:value].push(
                        name: 'requestBody',
                        value: format_request_body(entry, schemas)
                    )
                end
            end
            if entry[:response][:params] != {}
                value_entry[:value].push(
                    name: 'responses',
                    value: format_response(entry, schemas)
                )
            end
            data[:value].push(value_entry)
        end
        data
    end

    def format_parameters(route)
        data = []
        route[:parameters].keys.each do |key|
            data += [format_point('in', 'path'), {
                name: nil,
                value: [
                    format_inline('name', key),
                    format_inline('required', 'true'),
                    {
                        name: 'schema',
                        value: [{
                            name: 'type',
                            value: route[:parameters][key],
                            inline: true
                        }]
                    }
                ]
            }]
        end
        data
    end

    def format_request_body(route, schemas)
        [{
            name: 'content',
            value: [{
                name: 'application/json',
                value: [{
                    name: 'schema',
                    value: format_ref(route[:request], schemas)
                }]
            }]
        }]
    end

    def format_response(route, schemas)
        payload = route_payload(route, schemas)
        [
            response('200', 'Successful Response', payload),
            response('404', 'Not found', [format_inline('type', 'object')])
        ]
    end

    def route_payload(route, schemas)
        if route[:response][:array]
            [
                format_inline('type', 'array'),
                {
                    name: 'items',
                    value: format_ref(route[:response], schemas)
                }
            ]
        else
            format_ref(route[:response], schemas)
        end
    end

    def response(status_code, message, payload)
        schema = response_object(payload)
        {
            name: status_code,
            value: [
                format_inline('description', message),
                {
                    name: 'content',
                    value: [{
                        name: 'application/json',
                        value: [{
                            name: 'schema',
                            value: schema
                        }]
                    }]
                }
            ]
        }
    end

    def response_object(payload)
        [
            format_inline('type', 'object'),
            {
                name: 'properties',
                value: [
                    {
                        name: 'status',
                        value: [format_inline('type', 'string')]
                    },
                    {
                        name: 'message',
                        value: [format_inline('type', 'string')]
                    },
                    {
                        name: 'payload',
                        value: payload
                    }
                ]
            }
        ]
    end

    def yaml_format(routes, schemas)
        routes = routes.keys.map do |key|
            format_routes(key, routes[key], schemas)
        end
        schemas = format_schemas(schemas)
        [
            {
                name: 'openapi',
                value: '3.0.2'
            },
            {
                name: 'info',
                value: [
                    {
                        name: 'title',
                        value: 'Tapp API'
                    },
                    {
                        name: 'description',
                        value: 'Provides information for the frontend to display and add data'
                    },
                    {
                        name: 'version',
                        value: '1.0'
                    }
                ]
            },
            {
                name: 'paths',
                value: routes
            },
            {
                name: 'components',
                value: [
                    {
                        name: 'schemas',
                        value: schemas
                    }
                ]
            }
        ]
    end

    def convert_to_yaml(data, output = '', tabs = 0)
        tab = '  '
        data.each do |item|
            if item[:name]
                linebreak = item[:inline] ? '' : "\n"
                semicolon = item[:inline] && !item[:value] ? "\n" : ':'
                output += "#{tab * tabs}#{item[:name]}#{semicolon}#{linebreak}"
            end
            if item[:value].is_a?(Array)
                output = convert_to_yaml(item[:value], output, tabs + 1)
            elsif item[:inline]
                output += item[:value] ? " #{item[:value]}\n" : ''
            elsif item[:no_quotes]
                output += item[:value] ? "#{tab * (tabs + 1)}#{item[:value]}\n" : ''
            else
                output += item[:value] ? "#{tab * (tabs + 1)}\"#{item[:value]}\"\n" : ''
            end
        end
        output
    end

    def format_schemas(schemas)
        schemas.keys.map do |key|
            data = {
                name: key.to_s,
                value: [
                    format_inline('title', schemas[key][:title])
                ]
            }
            data[:value] += required_properties(schemas[key][:required])
            data[:value] += get_type(schemas[key][:data])
            data
        end
    end

    def format_ref(reference, schemas)
        if reference[:params].is_a?(Symbol)
            unless schemas.key?(reference[:params])
                abort(
                    "\'#{reference[:params]}\' is not a valid schema name. " \
                    "The following are all the available schemas:\n" \
                    "\t#{schemas.keys.join("\n\t")}"
                )
            end
            ref = "\'#/components/schemas/#{reference[:params]}\'"
            [format_inline('$ref', ref)]
        else
            format_params(reference)
        end
    end

    def format_params(reference)
        if reference[:params]
            data = required_properties(reference[:required] || [])
            data += get_type(reference[:params])
            data
        else
            []
        end
    end

    def format_point(item, value = nil)
        format_inline("- #{item}", value)
    end

    def format_inline(entry_name, value)
        {
            name: entry_name,
            value: value,
            inline: true
        }
    end

    def get_type(type)
        if type.is_a?(Array)
            data = [
                format_inline('type', 'array'),
                {
                    name: 'items',
                    value: []
                }
            ]
            type.map do |item|
                value = get_type(item)
                if value.is_a?(String)
                    data[1][:value].push(format_inline('type', value))
                else
                    data[1][:value] += value
                end
            end
            if data[1][:value].length.positive?
                data
            else
                abort('An array type must have its item type declared')
            end
        elsif type.is_a?(Hash)
            data = [
                format_inline('type', 'object'),
                {
                    name: 'properties',
                    value: []
                }
            ]
            data[1][:value] = type.keys.map do |key|
                value = get_type(type[key])
                temp = [format_inline('type', value)]
                if type[key] == :datetime || type[key] == :float
                    entry = format_inline('format', type[key] == :float ? 'float' : 'date-time')
                    temp.push(entry)
                end
                value = value.is_a?(Array) ? value : temp
                {
                    name: key,
                    value: value
                }
            end
            data
        else
            case type
            when :integer
                'integer'
            when :float
                'number'
            when :string
                'string'
            when :text
                'string'
            when :datetime
                'string'
            when :boolean
                'boolean'
            else
                abort(
                    "'#{type}' is not a valid type. The following are the valid types:" \
                    "\tstring\n\tinteger\nf\tloat\n\tdatetime\n\tboolean"
                )
            end
        end
    end

    def min_params(route)
        route[:path].scan(%r{(?:\/:)([\w]+)}).map { |i| i[0].to_sym }
    end

    def model_attributes(table)
        data = {}
        table.columns_hash.each { |i, j| data[i.to_sym] = j.type }
        data
    end

    def required_properties(required)
        data = []
        if required.length.positive?
            data.push(name: 'required')
            required.each do |item|
                data.push(format_point(item.to_s))
            end
        end
        data
    end

    def controller_to_input(controller)
        "#{controller.to_s[0..-2]}_input".to_sym
    end

    def write_file(destination, data)
        file = File.open("#{Rails.root}#{destination}", 'w')
        file.puts(data)
    end

    def route_name(controller, route_name = nil)
        route_name ||= 'create'
        "#{controller}_#{route_name}"
    end
end
