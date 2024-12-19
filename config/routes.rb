Rails.application.routes.draw do
  devise_for :users
  root to: "stampcards#index"
  resources :stampcards, only: [:index, :show] do
    member do
      post 'add_stamp'
      post 'redeem'
    end
  end
end
