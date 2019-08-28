namespace :api do
    desc "create yaml for API"
    task document: :environment do
        require 'api_doc.rb'
        include RouteAnalyzer
        routes, schemas = update_route_documentation(API)
        passed, routes = routes_documented?(routes, schemas)
        file = '/docs/api.yml'
        write_file(file, convert_to_yaml(yaml_format(routes, schemas)))
        if !passed
            abort("Incomplete API documentation created at #{file}")
        else
            puts("Complete API documentation created at #{file}")
        end
    end

    task schemas: :environment do
        require 'api_doc.rb'
        include RouteAnalyzer
        routes, schemas = update_route_documentation(API)
        all_schemas(schemas)
    end
    
    task routes: :environment do
        require 'api_doc.rb'
        include RouteAnalyzer
        routes, schemas = update_route_documentation(API)
        ind_map = key_to_index(routes)
        all_route_names(ind_map, routes)
    end
end
