# frozen_string_literal: true

Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root :to => 'application#index'

  namespace :api do
    namespace :v1 do
      resources :instructors, only: [:index, :create]
      resources :applicants, only: [:create, :update]
      resources :assignments, only: [:index, :show, :create, :update]
      resources :offers, only: [:index, :show]
      resources :sessions, only: [:index, :create]
      resources :sessions, :position_templates, only: [:index, :create]
      get '/available_position_templates', to: 'position_templates#available'

    end
  end

  get '*path', to: "application#index", constraints: ->(request) do
        !request.xhr? && request.format.html?
  end
end
