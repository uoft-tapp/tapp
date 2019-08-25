namespace :api do
    desc "create yaml for API"
    task document: :environment do
        require 'api_doc.rb'
        include RouteAnalyzer
        routes, schemas = all_routes
        update_route_documentation(routes, API)
        passed, routes = routes_documented?(routes)
        file = '/config/api.yml'
        write_file(file, convert_to_yaml(yaml_format(routes, schemas)))
        if !passed
            abort("Incomplete API documentation created at #{file}")
        else
            puts("Complete API documentation created at #{file}")
        end
    end
end
