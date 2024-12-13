class Stampcard < ApplicationRecord

  validates :stamp_number, presence: true

  belongs_to :user
end
