class QrCode < ApplicationRecord
  validates :code, presence: true

  has_many :users
end
