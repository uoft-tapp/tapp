# frozen_string_literal: true

# This module is responsible for generating the documentation for routes
# so that structured routes are auto-generated, whereas the custom ones
# can be added via docs/api_doc.rb. This module is also responsible for
# the Travis test portion of the API Documentation.
module RouteAnalyzer
    include FakeData
    include SeedsHandler
    include SwaggerConverter
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
                if data[key][:request]
                    required_type_check(data[key][:request][:required], key)
                    params_type_check(data[key][:request][:params], 'request', key)
                    routes[label][ind][:request] = data[key][:request]
                end
                if data[key][:response]
                    params_type_check(data[key][:response][:params], 'response', key)
                    routes[label][ind][:response] = data[key][:response]
                end
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

    def params_value_check(type)
        valid_types = %i[integer float string text datetime boolean]
        unless valid_types.include?(type)
            abort(
                "'#{type}' is not a valid type. The following are the valid types:" \
                "\t#{valid_types.join("\n\t")}"
            )
        end
    end

    def params_type_check(params, parent, key)
        return if params.blank? && parent == 'response'

        if !params.is_a?(Symbol) && !params.is_a?(Hash) && !params.is_a?(Array)
            abort(
                "Invalid #{parent} params for \'#{key}\'." \
                "\n\t:params can only be a symbol, hash, or array."
            )
        end
    end

    def required_type_check(required, key)
        unless required.is_a?(Array)
            abort(
                "Invalid request params for \'#{key}\'." \
                "\n\t:required can only be an array."
            )
        end
    end

    def reference_check(reference, schemas)
        unless schemas.key?(reference)
            abort(
                "\'#{reference}\' is not a valid schema name. " \
                "The following are all the available schemas:\n" \
                "\t#{schemas.keys.join("\n\t")}"
            )
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
                data: schemas[controller][:data].except(:id, :created_at, :updated_at),
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
                entry[:request][:params] = [
                    {
                        reference: controller_to_input(entry[:controller])
                    },
                    {
                        title: "JSON for updating #{controller}",
                        reference: controller_to_input(entry[:controller]),
                        required: %i[id],
                        params: {
                            id: :integer
                        }
                    }
                ]
                entry[:response][:params] = [
                    {
                        array: array_result(entry[:path]),
                        title: "reponse for creating #{controller}",
                        reference: entry[:controller]
                    },
                    {
                        title: "reponse for updating #{controller}",
                        reference: entry[:controller]
                    }
                ]
            when :index
                entry[:summary] = "Show all #{controller}s"
                if entry[:request][:required].length.positive?
                    entry[:summary] += " given #{entry[:request][:required].join(',')}"
                end
                entry[:request][:reference] = format_required_input(entry[:request][:required])
                entry[:response][:array] = true
                entry[:response][:reference] = entry[:controller]
            when :delete
                entry[:summary] = "Delete #{controller} given id"
                entry[:request][:required] = [:id]
                entry[:request][:params] = {
                    id: :integer
                }
                entry[:response][:reference] = entry[:controller]
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
                    elsif route[:response][:params].blank? && route[:response][:reference].blank?
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

    def min_params(route)
        route[:path].scan(%r{(?:\/:)([\w]+)}).map { |i| i[0].to_sym }
    end

    def model_attributes(table)
        data = {}
        table.columns_hash.each { |i, j| data[i.to_sym] = j.type }
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
