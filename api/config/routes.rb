# frozen_string_literal: true

Rails.application.routes.draw do
    # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

    root :to => 'application#index'

    namespace :api do
        namespace :v1 do
            # instructor routes
            post '/instructors/delete' => 'instructors#delete'
            resources :instructors, only: [:index, :create]

            # position routes
            post '/positions/delete' => 'positions#delete'
            resources :positions, only: [:index, :create] do
                resources :instructors, only: [:index]
                resources :assignments, only: [:index, :create]
                post '/instructors', to: 'instructors#create'
                post '/instructors/delete', to: 'instructors#delete_instructor_by_position'
            end

            # applicant routes
            post '/applicants/delete' => 'applicants#delete'
            resources :applicants, only: [:index, :create]

            # assignment routes
            post '/assignments/delete' => 'assignments#delete'
            resources :assignments, only: [:index, :create] do
                resources :wage_chunks, only: [:index]
                post '/add_wage_chunk', to: 'wage_chunks#create'
                get '/active_offer', to: 'offers#active_offer'
            end

            # wage_chunk routes
            post '/wage_chunks/delete' => 'wage_chunks#delete'
            resources :wage_chunks, only: [:index, :create] do 
                post '/add_reporting_tag', to: 'reporting_tags#create'
            end

            # application routes
            post '/applications/delete' => 'applications#delete'
            resources :applications, only: [:index, :create] do
                post '/add_preference', to: 'position_preferences#create'
            end

            # session routes
            post '/sessions/delete' => 'sessions#delete'
            resources :sessions, only: [:index, :create] do
                resources :positions, only: [:index, :create]
                resources :position_templates, only: [:index]
                resources :applications, only: [:index, :create]
                resources :applicants, only: [:index]
                resources :instructors, only: [:index]
                post '/add_position_template', to: 'position_templates#create'
                get '/instructors', to: 'instructors#instructor_by_session'
            end

            # position_template routes
            post '/position_templates/delete' => 'position_templates#delete'
            resources :position_templates, only: [:index, :create]
            get '/available_position_templates', to: 'position_templates#available'

            # reporting_tag routes
            post '/reporting_tags/delete' => 'reporting_tags#delete'
            resources :reporting_tags, only: [:index, :create]

            # position_preference routes
            post '/position_preferences/delete' => 'position_preferences#delete'
            resources :position_preferences, only: [:index, :create]

            # offer routes
            resources :offers, only: %i[create show], param: :url_token do
                member do
                    get 'pdf', to: 'offers#pdf'
                    post 'accept', to: 'offers#accept'
                    post 'reject', to: 'offers#reject'
                end
            end
            post '/email_offer', to: 'offers#email_offer'
            post '/withdraw_offer', to: 'offers#withdraw_offer'
            post '/nag', to: 'offers#nag'
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
