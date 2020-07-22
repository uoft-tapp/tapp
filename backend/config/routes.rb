# frozen_string_literal: true

#
# Constraints for authentication
#
# These should probably not be located here, but I'm not sure
# where to put them...
module Constraint
    class AuthenticatedAdmin
        def matches?(request)
            active_user = ActiveUserService.active_user
            return true if active_user.is_admin?
            Rails.logger.warn "Permission Denied: User '#{
                                  active_user.utorid
                              }' attempted to access a /admin route without permission."
            false
        end
    end

    class AuthenticatedInstructor
        def matches?(request)
            active_user = ActiveUserService.active_user
            return true if active_user.is_instructor?
            Rails.logger.warn "Permission Denied: User '#{
                                  active_user.utorid
                              }' attempted to access a /instructor route without permission."
            false
        end
    end

    class AuthenticatedTA
        def matches?(request)
            active_user = ActiveUserService.active_user
            return true if active_user.is_ta?
            Rails.logger.warn "Permission Denied: User '#{
                                  active_user.utorid
                              }' attempted to access a /ta route without permission."
            false
        end
    end
end

Rails.application.routes.draw do
    namespace :api do
        namespace :v1 do
            # Debug
            unless Rails.env.production?
                resources :debug, only: [] do
                    collection do
                        get :active_user, to: 'debug#active_user'
                        post :active_user, to: 'debug#set_active_user'
                        post :clear_data, to: 'debug#clear_data'
                        post :restore_snapshot, to: 'debug#restore_snapshot'
                        post :snapshot, to: 'debug#snapshot'
                        get :users, to: 'debug#users'
                        post :users, to: 'debug#upsert_user'
                    end
                end
            end

            namespace :admin do
                constraints(Constraint::AuthenticatedAdmin.new) do
                    # Active User
                    get :active_user, to: 'users#active_user'
                    # resource :active_user, only: [:index]

                    # Applicants
                    resources :applicants, only: %i[index show create]

                    # Application
                    resources :applications, only: :create

                    # Assignments
                    resources :assignments, only: %i[show create] do
                        resources :wage_chunks,
                                  controller: :assignment_wage_chunks,
                                  only: %i[index create]
                        resources :offers,
                                  path: :active_offer,
                                  controller: :active_offers,
                                  only: :index do
                            collection do
                                post 'create'
                                post :accept
                                post :reject
                                post :withdraw
                                post :email
                                post :nag
                            end
                        end
                        member do
                            get :ddah, to: 'ddahs#show_by_assignment'
                            post :ddah, to: 'ddahs#upsert_by_assignment'
                        end
                    end

                    # Contract Templates
                    get :available_contract_templates,
                        to: 'contract_templates#available'

                    # Contract Templates
                    resources :contract_templates, only: %i[index create] do
                        collection { post :delete, :upload }
                        member do
                            get :view
                            get :download
                        end
                    end

                    # Instructors
                    resources :instructors, only: %i[index create] do
                        collection { post :delete }
                    end

                    # Positions
                    resources :positions, only: %i[create] do
                        collection { post :delete }
                    end

                    # Sessions
                    resources :sessions, only: %i[index create] do
                        collection { post :delete, to: 'sessions#delete' }
                        resources :applicants, only: %i[index create]
                        resources :applications, only: %i[index]
                        resources :assignments, only: %i[index]
                        resources :ddahs, only: %i[index]
                        resources :contract_templates, only: %i[index create]
                        resources :positions,
                                  controller: :session_positions,
                                  only: %i[index create]
                    end

                    # DDAHs
                    resources :ddahs, only: %i[show create] do
                        member do
                            post :approve
                            post :email
                        end
                    end

                    # Users
                    resources :users, only: %i[index create]

                    # Wage Chunks
                    resources :wage_chunks, only: %i[create] do
                        collection { post :delete }
                    end
                end
            end

            namespace :instructor do
                constraints(Constraint::AuthenticatedInstructor.new) do
                    # Active User
                    get :active_user, to: 'users#active_user'

                    # Sessions
                    resources :sessions, only: %i[index] do
                        resources :applicants, only: %i[index]
                        resources :applications, only: %i[index]
                        resources :assignments, only: %i[index]
                        resources :contract_templates, only: %i[index]
                        resources :positions, only: %i[index]
                    end

                    # Instructors
                    resources :instructors, only: %i[index]
                end
            end

            namespace :ta do
                constraints(Constraint::AuthenticatedTA.new) do
                    # Active User
                    get :active_user, to: 'users#active_user'
                end
            end
        end
    end

    namespace :public do
        resources :contracts, only: %i[show] do
            get :view, to: 'contracts#view'
            post :accept, to: 'contracts#accept'
            post :reject, to: 'contracts#reject'
        end
        resources :ddahs, only: %i[show] do
            get :view, to: 'ddahs#view'
            post :accept, to: 'ddahs#accept'
        end
    end

    # Catch all other route requests and deliver a standard error payload.
    # Routes that are inaccessible due to lacking permission also end up here.
    #
    # This must be the last route declared as it matches everything.
    #    match '*path', to: 'missing_routes#error', via: :all
end
