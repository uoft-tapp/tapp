# frozen_string_literal: true

# This module is responsible for generating the yml in accordance to Swagger
module SwaggerConverter
    include ApiDocValidator
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

    def yaml_format(routes, schemas)
        routes = routes.keys.map do |key|
            format_routes(key, routes[key])
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

    def format_routes(path, route)
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
            if entry[:method] == :post
                value_entry[:value].push(
                    name: 'requestBody',
                    value: format_request_body(entry)
                )
            end
            value_entry[:value].push(
                name: 'responses',
                value: format_response(entry)
            )
            data[:value].push(value_entry)
        end
        data
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

    def format_request_body(route)
        [{
            name: 'content',
            value: [{
                name: 'application/json',
                value: [{
                    name: 'schema',
                    value: get_form_data(route[:request])
                }]
            }]
        }]
    end

    def format_response(route)
        [
            response('200', 'Successful Response', get_form_data(route[:response])),
            response('404', 'Not found', [format_inline('type', 'object')])
        ]
    end

    def response(status_code, message, payload)
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
                            value: response_object(payload)
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

    def get_form_data(entry, depth = 1)
        if entry.is_a?(Hash)
            get_data_body(entry)
        elsif entry.is_a?(Array)
            if depth == 1
                data = []
                entry.each do |item|
                    data.push(get_form_data(item, depth + 1))
                end
                get_oneof(data)
            else
                abort('Illegal formatting in api_doc.rb')
            end
        else
            abort('Illegal formatting in api_doc.rb')
        end
    end

    def get_data_body(entry)
        if !entry[:params]
            entry[:reference] = [entry[:reference]] if entry[:title]
            get_reference(entry[:reference], entry[:array])
        elsif entry[:params].is_a?(Hash)
            if !entry[:reference]
                entry[:params] = entry[:array] ? [entry[:params]] : entry[:params]
                data = required_properties(entry[:required] || [])
                data.push(format_inline('title', entry[:title])) if entry[:title]
                data += get_type(entry[:params])
                data
            else
                if entry[:reference].is_a?(Array)
                    entry[:reference].push(entry[:params])
                else
                    entry[:reference] = [entry[:reference], entry[:params]]
                end
                entry[:reference] = entry[:reference].reject { |i| i == {} }
                get_allof(entry)
            end
        else
            abort('Illegal formatting in api_doc.rb')
        end
    end

    def get_reference(reference, array = false)
        if reference.is_a?(Symbol)
            ref = "\'#/components/schemas/#{reference}\'"
            [format_inline('$ref', ref)]
        elsif reference.is_a?(Array)
            get_allof(reference: reference, array: array)
        end
    end

    def get_oneof(entries)
        data = []
        entries.each do |item|
            data += object_to_point(item)
        end
        [format_inline('type', 'object'), { name: 'oneOf', value: data }]
    end

    def get_allof(entry)
        data = [format_inline('type', entry[:array] ? 'array' : 'object')]
        data += required_properties(entry[:required] || [])
        data.push(format_inline('title', entry[:title])) if entry[:title]
        temp = []
        entry[:reference].each do |item|
            temp += if item.is_a?(Symbol)
                        object_to_point(get_reference(item))
                    else
                        object_to_point(get_type(item))
                    end
        end
        if entry[:array]
            data.push(
                name: 'items', value:
                [{
                    name: 'allOf',
                    value: temp
                }]
            )
        else
            data.push(name: 'allOf', value: temp)
        end
        data
    end

    def object_to_point(data)
        data[0][:name] = "- #{data[0][:name]}"
        if data.length > 1
            data = [
                data[0],
                { value: data[1..-1] }
            ]
        end
        data
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
            process_array_type(type)
        elsif type.is_a?(Hash)
            process_hash_type(type)
        else
            case type
            when :integer
                'integer'
            when :float
                'number'
            when :boolean
                'boolean'
            else
                'string'
            end
        end
    end

    def process_array_type(type)
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
    end

    def process_hash_type(type)
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
end
