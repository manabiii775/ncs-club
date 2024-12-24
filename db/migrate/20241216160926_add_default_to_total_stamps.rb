class AddDefaultToTotalStamps < ActiveRecord::Migration[7.0]
  def change
    change_column_default :stampcards, :total_stamps, from: nil, to: 0
  end
end
