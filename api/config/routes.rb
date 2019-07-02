# frozen_string_literal: true

Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root :to => 'application#index'

  namespace :api do
    namespace :v1 do
      resources :instructors, only: [:index]
      resources :positions do 
        resources :instructors, only: [:index]
        resources :assignments, only: [:index, :create]
        post '/add_instructor', to: 'instructors#create'
      end
      resources :applicants, only: [:index, :create]
      resources :assignments, only: [:index] do
        post '/add_wage_chunk', to: 'wage_chunks#create'
        get '/active_offer', to: 'offers#active_offer'
      end
      resources :wage_chunks do 
        post '/add_reporting_tag', to: 'reporting_tags#create'
      end
      resources :offers, only: [:create]
      resources :applications, only: [:index] do
        post '/add_preference', to: 'preferences#create'
      end
      resources :sessions, only: [:index, :create] do
        resources :positions, only: [:index, :create]
        resources :position_templates, only: [:index]
        resources :applications, only: [:index, :create]
        post '/add_position_template', to: 'position_templates#create'
      end
      get '/available_position_templates', to: 'position_templates#available'
      post '/email_offer', to: 'offers#email_offer'
      post '/ta/offers/:offer_id/respond_to_offer', to: 'offers#respond'
    end
  end

  get '*path', to: "application#index", constraints: ->(request) do
        !request.xhr? && request.format.html?
  end
end
