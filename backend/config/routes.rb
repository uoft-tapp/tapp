# frozen_string_literal: true

#
# Constraints for authentication
#
# These should probably not be located here, but I'm not sure
# where to put them...
module Constraint
    class AuthenticatedAdmin
        def matches?(request)
            active_user = ActiveUserService.active_user request
            return true if active_user.is_admin?
            Rails.logger.warn "Permission Denied: User '#{
                                  active_user.utorid
                              }' attempted to access a /admin route without permission."
            false
        end
    end

    class AuthenticatedInstructor
        def matches?(request)
            active_user = ActiveUserService.active_user request
            return true if active_user.is_instructor?
            Rails.logger.warn "Permission Denied: User '#{
                                  active_user.utorid
                              }' attempted to access a /instructor route without permission."
            false
        end
    end

    class AuthenticatedTA
        def matches?(request)
            active_user = ActiveUserService.active_user request
            return true if active_user.is_ta?
            Rails.logger.warn "Permission Denied: User '#{
                                  active_user.utorid
                              }' attempted to access a /ta route without permission."
            false
        end
    end
end

Rails
    .application
    .routes
    .draw do
        namespace :api do
            namespace :v1, format: false do
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
                            get :routes, to: 'debug#routes'
                            get :serializers, to: 'debug#serializers'
                        end
                    end
                end

                namespace :admin do
                    constraints(Constraint::AuthenticatedAdmin.new) do
                        # Active User
                        get :active_user, to: 'users#active_user'

                        # resource :active_user, only: [:index]

                        # Applicants
                        resources :applicants, only: %i[index show create] do
                            collection { post :delete }
                        end

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
                        resources :contract_templates, only: %i[create] do
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
                            resource :reporting_tags,
                                     controller: :position_reporting_tags,
                                     only: %i[show create] do
                                collection { post :delete }
                            end
                        end

                        # Sessions
                        resources :sessions, only: %i[index create] do
                            collection { post :delete, to: 'sessions#delete' }
                            resources :applicants, only: %i[index create]
                            resources :applications, only: %i[index create]
                            resources :assignments, only: %i[index]
                            resources :ddahs, only: %i[index] do
                                collection do
                                    get :accepted_list,
                                        to: 'ddahs#accepted_list',
                                        format: nil # setting format to `nil` makes :format an optional url param
                                end
                            end
                            resources :contract_templates,
                                      only: %i[index create]
                            resources :positions,
                                      controller: :session_positions,
                                      only: %i[index create] do
                                collection do
                                    get :reporting_tags,
                                        to:
                                            'session_reporting_tags#index_by_position'
                                end
                            end
                            resources :wage_chunks, only: %i[] do
                                collection do
                                    get :reporting_tags,
                                        to:
                                            'session_reporting_tags#index_by_wage_chunk'
                                end
                            end
                            resources :postings, only: %i[index create]
                            resources :posting_positions, only: %i[index]
                        end

                        # DDAHs
                        resources :ddahs, only: %i[show create] do
                            member do
                                post :approve
                                post :email
                                post :delete
                            end
                        end

                        # Users
                        resources :users, only: %i[index create]

                        # Wage Chunks
                        resources :wage_chunks, only: %i[create] do
                            collection { post :delete }
                            resource :reporting_tags,
                                     controller: :wage_chunk_reporting_tags,
                                     only: %i[show create] do
                                collection { post :delete }
                            end
                        end

                        # Postings
                        resources :postings, only: %i[create show] do
                            collection { post :delete }

                            # XXX For some reasong `index` doesn't work for a `posting_position`, only
                            # `show`. I don't know why...Ideally we should be using `index`.
                            resource :posting_positions, only: %i[show create]
                            resource :survey,
                                     to: 'postings#survey',
                                     only: %i[show]
                        end

                        # PostingPositions
                        resources :posting_positions, only: %i[create show] do
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
                            resources :ddahs, only: %i[index]
                        end

                        # Instructors
                        resources :instructors, only: %i[index create]

                        # DDAHs
                        resources :ddahs, only: %i[show create]
                    end
                end

                namespace :ta do
                    constraints(Constraint::AuthenticatedTA.new) do
                        # Active User
                        get :active_user, to: 'users#active_user'
                    end
                end

                # We can get the active user without passing any authentication check
                get :active_user, to: 'users#active_user'
            end
        end

        namespace :public, format: false do
            # setting format to `nil` makes :format an optional url param
            resources :contracts, only: %i[show], format: nil do
                get :view, format: false, to: 'contracts#view'
                get :details, format: false, to: 'contracts#details'
                post :accept, format: false, to: 'contracts#accept'
                post :reject, format: false, to: 'contracts#reject'
            end
            resources :ddahs, format: nil, only: %i[show] do
                get :view, format: false, to: 'ddahs#view'
                post :accept, format: false, to: 'ddahs#accept'
            end
            resources :postings, only: %i[show] do
                post :submit, to: 'postings#submit'
            end
            resources :files, only: %i[show]
        end

        # Catch all other route requests and deliver a standard error payload.
        # Routes that are inaccessible due to lacking permission also end up here.
        #
        # This must be the last route declared as it matches everything.
        match '*path', to: 'missing_routes#error', via: :all
    end
