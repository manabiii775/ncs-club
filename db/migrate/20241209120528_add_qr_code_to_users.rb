class AddQrCodeToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :qr_code, :integer, foreign_key: true
  end
end
