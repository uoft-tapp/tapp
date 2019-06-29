# frozen_string_literal: true

Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root :to => 'application#index'

  namespace :api do
    namespace :v1 do
      resources :instructors, only: [:index]
      resources :positions do 
        resources :instructors, only: [:index]
        post '/add_instructor', to: 'instructors#create'
      end
      resources :applicants, only: [:create, :update]
      resources :assignments, only: [:index, :show, :create, :update]
      resources :offers, only: [:index, :show]
      resources :sessions, only: [:index, :create]
      resources :sessions do
        resources :positions, only: [:index, :create]
        resources :position_templates, only: [:index]
        post '/add_position_template', to: 'position_templates#create'
      end
      get '/available_position_templates', to: 'position_templates#available'

    end
  end

  get '*path', to: "application#index", constraints: ->(request) do
        !request.xhr? && request.format.html?
  end
end
