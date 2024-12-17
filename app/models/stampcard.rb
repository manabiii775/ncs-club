class Stampcard < ApplicationRecord

  validates :total_stamps, presence: true

  belongs_to :user
  has_many :stamps

  # スタンプ数を返すメソッドを追加
  def total_stamps
    stamps.count
  end
end
