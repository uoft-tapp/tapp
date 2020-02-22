# frozen_string_literal: true

Rails.application.routes.draw do
    namespace :api do
        namespace :v1 do
            # Debug
            unless Rails.env.production?
                resources :debug, only: [] do
                    collection do
                        get :active_user, to: 'debug#active_user'
                        post :active_user, to: 'debug#create_active_user'
                        post :clear_data, to: 'debug#clear_data'
                        post :restore_snapshot, to: 'debug#restore_snapshot'
                        post :snapshot, to: 'debug#snapshot'
                    end
                end
            end

            namespace :admin do
                # Active User
                # resource :active_user, only: [:index]

                # Applicants
                resources :applicants, only: %i[index show create]

                # Application
                resources :applications, only: :create

                # Assignments
                resources :assignments, only: %i[show create] do
                    resources :wage_chunks, controller: :assignment_wage_chunks, only: %i[index create]
                    resources :offers, path: :active_offer, controller: :active_offers, only: :index do
                        collection do
                            post 'create'
                            post :accept
                            post :reject
                            post :withdraw
                            post :email
                            post :nag
                        end
                    end
                end

                # Contract Templates
                get :available_contract_templates, to: 'contract_templates#available'

                # Instructors
                resources :instructors, only: %i[index create] do
                    collection do
                        post :delete
                    end
                end

                # Positions
                resources :positions, only: %i[create] do
                    collection do
                        post :delete
                    end
                end

                # Sessions
                resources :sessions, only: %i[index create] do
                    collection do
                        post :delete, to: 'sessions#delete'
                    end
                    resources :applicants, only: %i[index]
                    resources :applications, only: %i[index]
                    resources :assignments, only: %i[index]
                    resources :contract_templates, only: %i[index create]
                    resources :positions, controller: :session_positions, only: %i[index create]
                end

                # Users
                resources :users, only: %i[index create]

                # Wage Chunks
                resources :wage_chunks, only: %i[create] do
                    collection do
                        post :delete
                    end
                end
            end

            namespace :instructor do
            end

            namespace :ta do
            end
        end
    end
end
