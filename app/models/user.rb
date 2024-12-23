class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :nickname, presence: true
  validates :email, presence: true
  validates :phone_number, presence: true
  validates :birthday, presence: true
  validates :password, presence: true

  has_many :stampcards

  after_create :create_stampcard

  private
  
  def create_stampcard
    self.stampcards.create
  end
end
