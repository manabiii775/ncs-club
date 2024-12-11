class QrCode < ApplicationRecord
  validates :total_stamps, presence: true

  belongs_to :user
end
