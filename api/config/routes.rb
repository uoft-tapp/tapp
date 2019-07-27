# frozen_string_literal: true

Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root :to => 'application#index'

  namespace :api do
    namespace :v1 do
      resources :instructors, only: [:index, :update]

      post '/positions/delete' => 'positions#delete'
      resources :positions, only: [:create] do
        resources :instructors, only: [:index]
        resources :assignments, only: [:index, :create]
        post '/add_instructor', to: 'instructors#create'
      end
      resources :applicants, only: [:index, :create, :update]
      resources :assignments, only: [:index, :update] do
        resources :wage_chunks, only: [:index]
        post '/add_wage_chunk', to: 'wage_chunks#create'
        get '/active_offer', to: 'offers#active_offer'
      end
      resources :wage_chunks, only: [:index, :update] do 
        post '/add_reporting_tag', to: 'reporting_tags#create'
      end
      resources :offers, only: [:create]
      resources :applications, only: [:index, :update] do
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
      resources :position_templates, only: [:update]
      resources :reporting_tags, only: [:update]
      resources :position_preferences, only: [:update]
      get '/available_position_templates', to: 'position_templates#available'
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
