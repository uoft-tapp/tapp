# frozen_string_literal: true

Rails.application.routes.draw do
    # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

    root :to => 'application#index'

    namespace :api do
        namespace :v1 do
            # instructor routes
            post '/instructors/delete' => 'instructors#delete'
            post '/instructors/:id/delete' => 'instructors#delete'
            resources :instructors, only: [:index, :create]

            # position routes
            post '/positions/delete' => 'positions#delete'
            post '/positions/:id/delete' => 'positions#delete'
            resources :positions, only: [:create] do
                resources :instructors, only: [:index]
                resources :assignments, only: [:index, :create]
                post '/add_instructor', to: 'instructors#create'
            end

            # applicant routes
            post '/applicants/delete' => 'applicants#delete'
            post '/applicants/:id/delete' => 'applicants#delete'
            resources :applicants, only: [:index, :create]

            # assignment routes
            post '/assignments/delete' => 'assignments#delete'
            post '/assignments/:id/delete' => 'assignments#delete'
            resources :assignments, only: [:index, :create] do
                resources :wage_chunks, only: [:index]
                post '/add_wage_chunk', to: 'wage_chunks#create'
                get '/active_offer', to: 'offers#active_offer'
            end

            # wage_chunk routes
            post '/wage_chunks/delete' => 'wage_chunks#delete'
            post '/wage_chunks/:id/delete' => 'wage_chunks#delete'
            resources :wage_chunks, only: [:index, :create] do 
                post '/add_reporting_tag', to: 'reporting_tags#create'
            end

            # application routes
            post '/applications/delete' => 'applications#delete'
            post '/applications/:id/delete' => 'applications#delete'
            resources :applications, only: [:index, :create] do
                post '/add_preference', to: 'position_preferences#create'
            end

            # session routes
            post '/sessions/delete' => 'sessions#delete'
            post '/sessions/:id/delete' => 'sessions#delete'
            resources :sessions, only: [:index, :create] do
                resources :positions, only: [:index, :create]
                resources :position_templates, only: [:index]
                resources :applications, only: [:index, :create]
                resources :applicants, only: [:index]
                post '/add_position_template', to: 'position_templates#create'
            end

            # position_template routes
            post '/position_templates/delete' => 'position_templates#delete'
            post '/position_templates/:id/delete' => 'position_templates#delete'
            resources :position_templates, only: [:create]
            get '/available_position_templates', to: 'position_templates#available'

            # reporting_tag routes
            post '/reporting_tags/delete' => 'reporting_tags#delete'
            post '/reporting_tags/:id/delete' => 'reporting_tags#delete'
            resources :reporting_tags, only: [:create]

            # position_preference routes
            post '/position_preferences/delete' => 'position_preferences#delete'
            post '/position_preferences/:id/delete' => 'position_preferences#delete'
            resources :position_preferences, only: [:create]

            # offer routes
            resources :offers, only: [:create]
            post '/email_offer', to: 'offers#email_offer'
            post '/ta/offers/:offer_id/respond_to_offer', to: 'offers#respond'
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
