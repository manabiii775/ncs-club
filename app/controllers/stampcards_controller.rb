class StampcardsController < ApplicationController
  before_action :authenticate_user!, only: [:show]

  def index
    @stampcards = Stampcard.all
  end

  def show
  end

end
