# frozen_string_literal: true

include RouteAnalyzer
Rails.application.routes.draw do
    # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

    root :to => 'application#index'

    namespace :api do
        namespace :v1 do
            # instructor routes
            post '/instructors/delete' => 'instructors#delete'
            resources :instructors, only: [:index]
            resources :instructors, only: [:create], as: route_name(:instructors)

            # position routes
            post '/positions/delete' => 'positions#delete'
            resources :positions, only: [:index] do
                resources :instructors, only: [:index]
                resources :assignments, only: [:index]
                resources :assignments, only: [:create], as: route_name(:assignments)
                post '/add_instructor', to: 'instructors#create'
            end
            resources :positions, only: [:create], as: route_name(:positions)

            # applicant routes
            post '/applicants/delete' => 'applicants#delete'
            resources :applicants, only: [:index]
            resources :applicants, only: [:create], as: route_name(:applicants)

            # assignment routes
            post '/assignments/delete' => 'assignments#delete'
            resources :assignments, only: [:index] do
                resources :wage_chunks, only: [:index]
                post '/add_wage_chunk', to: 'wage_chunks#create'
                get '/active_offer', to: 'offers#active_offer'
            end
            resources :assignments, only: [:create], as: route_name(:assignments)

            # wage_chunk routes
            post '/wage_chunks/delete' => 'wage_chunks#delete'
            resources :wage_chunks, only: [:index] do 
                post '/add_reporting_tag', to: 'reporting_tags#create'
            end
            resources :wage_chunks, only: [:create], as: route_name(:wage_chunks)

            # application routes
            post '/applications/delete' => 'applications#delete'
            resources :applications, only: [:index] do
                post '/add_preference', to: 'position_preferences#create'
            end
            resources :applications, only: [:create], as: route_name(:applications)

            # session routes
            post '/sessions/delete' => 'sessions#delete'
            resources :sessions, only: [:index] do
                resources :positions, only: [:index]
                resources :positions, only: [:create], as: route_name(:positions)
                resources :position_templates, only: [:index]
                resources :applications, only: [:index]
                resources :applications, only: [:create], as: route_name(:applications)
                resources :applicants, only: [:index]
                post '/add_position_template', to: 'position_templates#create'
                get '/instructors', to: 'instructors#instructor_by_session'
                post '/instructors/delete', to: 'instructors#delete_instructor_by_session'
            end
            resources :sessions, only: [:create], as: route_name(:sessions)

            # position_template routes
            post '/position_templates/delete' => 'position_templates#delete'
            resources :position_templates, only: [:index]
            resources :position_templates, only: [:create], 
                as: route_name(:position_templates)
            get '/available_position_templates', to: 'position_templates#available'

            # reporting_tag routes
            post '/reporting_tags/delete' => 'reporting_tags#delete'
            resources :reporting_tags, only: [:index]
            resources :reporting_tags, only: [:create], as: route_name(:reporting_tags)

            # position_preference routes
            post '/position_preferences/delete' => 'position_preferences#delete'
            resources :position_preferences, only: [:index]
            resources :position_preferences, only: [:create], 
                as: route_name(:position_preferences)

            # offer routes
            resources :offers, only: [:create]
            post '/email_offer', to: 'offers#email_offer'
            post '/ta/offers/:offer_id/respond_to_offer', to: 'offers#respond',
                as: route_name(:offers, "respond")
        end

        # This route makes sure that any requests with URLs of the form '/api/*' 
        # with no corresponding route gets a 404 instead of the frontend index file.
        # Redirecting to a specialized 404 route because this route is namespaced and
        # cannot call actions from the application controller.
        get '*path', to: redirect('/404')
    end

    # This route returns a 404 error status by throwing a rails routing error.  
    get '/404', to: 'application#not_found'

    # This matches all routes that do not begin with '/api' and returns the frontend
    # index file.  The request URL is then given to react router.  
    get '*path', to: "application#index", constraints: ->(request) do
        !request.xhr? && request.format.html?
    end
end
