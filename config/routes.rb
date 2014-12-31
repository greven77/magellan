Rails.application.routes.draw do
  devise_for :users,
    :controllers => {
      registrations: "users/registrations",
      sessions: "users/sessions"
    }

  get 'users', :to => 'users#index'
  get 'users/:id/trips', :to => 'users#trips'

  resources :trips do
    collection do
      get 'autocomplete'
    end
  end

  #match 'trips/autocomplete', :to => 'trips#autocomplete', :via => [:get]

  root 'travel#index'

  match '*path' => "travel#index", :via => [:get, :post]
end
