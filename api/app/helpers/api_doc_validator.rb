# frozen_string_literal: true

# This module is responsible for checking if the input from api_doc is invalid in
# dataat and type
module ApiDocValidator
    def routes_documented?(routes, schemas)
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
                    route_name = route[:name].to_s.sub('api_v1_', '').to_sym
                    valid_res, res = valid_form(
                        "response for \'#{route_name}\'", route[:response], schemas
                    )
                    valid_req, req = valid_form(
                        "request for \'#{route_name}\'", route[:request], schemas
                    )
                    if !route[:summary].length.positive?
                        incomplete.push("#{label}No summary set for this route")
                    elsif !valid_res
                        incomplete.push("#{label}#{res}")
                    elsif route[:request] && !valid_req
                        incomplete.push("#{label}#{req}")
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

    def valid_form(entry, data, schemas, depth = 1, require_title = false)
        if data.blank?
            if entry.split(' ')[0] == 'request'
                [true, nil]
            else
                [
                    false,
                    "The #{entry} cannot be empty."
                ]
            end
        elsif data.is_a?(Hash)
            valid, message = valid_title(entry, data[:title], require_title)
            return [valid, message] unless valid

            valid, message = valid_data(entry, data, schemas)
            if valid
                [true, nil]
            else
                [valid, message]
            end
        elsif data.is_a?(Array)
            if depth == 1
                data.each do |item|
                    exception = item[:reference] && item[:params].blank?
                    valid, message = valid_form(
                        entry, item, schemas, depth + 1, !exception
                    )
                    return [valid, message] unless valid
                end
                [true, nil]
            else
                [
                    false,
                    "The #{entry} cannot be a nested array."
                ]
            end
        else
            [
                false,
                "The #{entry} can only be either an array or hash."
            ]
        end
    end

    def valid_data(entry, data, schemas)
        valid_required(entry, data[:required])
        if !data[:params]
            if !data[:reference]
                [
                    false,
                    "The #{entry} has neither a reference nor params."
                ]
            else
                valid_reference(entry, data[:reference], schemas)
            end
        elsif data[:params].is_a?(Hash)
            valid_type(entry, data[:params])
        else
            p data
            [
                false,
                "The params for #{entry} can only be a hash."
            ]
        end
    end

    def valid_type(entry, type)
        all_types = %i[integer float string datetime boolean]
        if type.is_a?(Symbol)
            unless all_types.include?(type)
                return [
                    false,
                    all_types(entry, type, all_types)
                ]
            end
            [true, nil]
        elsif type.is_a?(Array)
            type.each do |item|
                valid, message = valid_type(entry, item)
                [valid, message] unless valid
            end
            [true, nil]
        elsif type.is_a?(Hash)
            type.keys.each do |item|
                valid, message = valid_type(entry, item)
                [valid, message] unless valid
            end
            [true, nil]
        else
            return [
                false,
                all_types(entry, type.class, all_types)
            ]
        end
        [true, nil]
    end

    def all_types(entry, invalid_type, all_types)
        "The #{entry} contains the invalid type, '#{invalid_type}'." \
        "The following are the valid types:\n\t#{all_types.join("\n\t")}"
    end

    def valid_title(entry, title, required = true)
        if title.blank?
            if required
                [
                    false,
                    "The title for the #{entry} is not set."
                ]
            else
                [true, nil]
            end
        elsif title.is_a?(String)
            [true, nil]
        else
            [
                false,
                "The title for the #{entry} is not a string."
            ]
        end
    end

    def valid_required(entry, required)
        unless required.blank?
            unless required.is_a?(Array)
                return [
                    false,
                    "The #{entry} is invalid." \
                    "\n\t:required can only be an array."
                ]
            end
        end
        [true, nil]
    end

    def valid_reference(entry, reference, schemas)
        if reference.is_a?(Symbol) && !schemas.key?(reference)
            return [
                false,
                "There is an invalid reference in #{entry}: " \
                "\'#{reference}\'. #{all_schemas(schemas)}"
            ]
        end
        [true, nil]
    end
end
